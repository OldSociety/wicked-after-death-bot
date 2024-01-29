const cron = require('node-cron')
const { EmbedBuilder } = require('discord.js')
const { battleManager, userBattles } = require('./battleManager')
const { traits, applyCritDamage } = require('../characterFiles/traits')
const LevelUpSystem = require('../characterFiles/levelUpSystem')
const RewardsHandler = require('../characterFiles/RewardsHandler')
const { createRoundEmbed } = require('./roundEmbed')
const { Character } = require('../../../../Models/model') // Adjust the path as needed
const {
  calcDamage,
  calcActualDamage,
  updateBufferHealth,
  updateHealth,
  compileDamageResult,
} = require('./applyDamageHelpers')

const { checkSpecialTrigger, executeSpecial } = require('./executeSpecial')

let cronTask = null
// let initializedCharacters = {}

// Function to calculate damage
async function applyDamage(attacker, defender, userId) {
  const randHit = Math.random() * 100
  let isCrit = false
  let actualDamage
  let bufferDamage = 0 // Initialize bufferDamage to 0

  // Calculate damage range
  const [minDamage, maxDamage, isCriticalHit] = calcDamage(attacker, randHit)

  // Apply Traits
  if (traits[defender.character_name]) {
    traits[defender.character_name](defender, isCriticalHit, attacker)
  }

  if (randHit < attacker.chance_to_hit * 100) {
    // Attack hits
    isCrit = isCriticalHit
    actualDamage = calcActualDamage(minDamage, maxDamage)
  } else {
    // Attack misses - apply 3/4 damage
    actualDamage = Math.round(calcActualDamage(minDamage, maxDamage) * 0.75)
    isCrit = false // Ensure critical hit is not considered on a miss
  }

  bufferDamage = Math.min(actualDamage, defender.buffer_health)

  updateBufferHealth(defender, bufferDamage)
  updateHealth(defender, actualDamage - bufferDamage)

  return compileDamageResult(
    attacker,
    defender,
    actualDamage,
    bufferDamage,
    isCrit,
    randHit >= attacker.chance_to_hit * 100 // didMiss is true if randHit is greater or equal to chance to hit
  )
}

// Function to apply a round of actions
const applyRound = async (attacker, defender, userName, interaction) => {
  if (attacker.current_health > 0 && defender.current_health > 0) {
    const actionResult = await applyDamage(attacker, defender)
    const actions = [actionResult]
    const roundEmbed = createRoundEmbed(actions, userName, attacker, defender)

    try {
      await interaction.followUp({ embeds: [roundEmbed], ephemeral: true })
    } catch (error) {
      console.error('Error in interaction follow-up:', error)
    }
    // Check if the battle should end (either attacker or defender has zero health)
    if (attacker.current_health <= 0 || defender.current_health <= 0) {
      return true // Indicates the battle has ended
    }
    return false // Indicates the battle continues
  } else {
    // One of the characters has zero health, so the battle ends
    return true
  }
}

async function handleCharacterAction(character, role, interaction, battleKey) {
  const battle = battleManager[battleKey];
  if (!battle || battle.battleEnded) return; // Check if battle has ended

  const defender = role === 'enemy' ? battle.characterInstance : battle.enemyInstance;
  const battleEnded = await applyRound(character, defender, battle.userName, interaction);

  // Check if the battle ends and ensure it's only processed once
  if (battleEnded && !battle.battleEnded) {
    battle.battleEnded = true; // Prevents double execution

    try {
      await handleBattleEnd(battleKey, interaction);
    } catch (error) {
      console.log('handlebattleEnd error: ', error);
    }

    stopBattleCronJobs(battleKey);
  }
}


// Function to calculate the attack speed of a character
function calculateAttackSpeed(character) {
  let baseSpeed = character.attackType === 'light' ? 6 : 8

  // if (character.tags.includes('rogue')) {
  //   if (character.attackType === 'light') {
  //     baseSpeed -= 1 // Rogues attack faster
  //   }
  // }

  return baseSpeed
}

// Function to set up a cron job for a character
const setupCharacterCron = (
  characterInstance,
  role,
  interaction,
  battleKey
) => {
  const attackSpeed = calculateAttackSpeed(characterInstance)
  const cronTask = cron.schedule(`*/${attackSpeed} * * * * *`, async () => {
    await handleCharacterAction(characterInstance, role, interaction, battleKey)
  })
  characterInstance.cronTask = cronTask // Assign the cron task to the character instance
}

// Function to initialize character flags and counters
function initializeCharacterFlagsAndCounters(character) {
  character.sp1Counter = 0
  character.special90 = false
  character.special60 = false
  character.special30 = false
  character.special90Triggered = false
  character.special60Triggered = false
  character.special30Triggered = false
  character.activeSpecials = []
}

// Function to handle the end of a battle
async function handleBattleEnd(battleKey, interaction) {
  const battle = battleManager[battleKey];
  if (!battle) return;

  const { characterInstance, enemyInstance, userId } = battle;

  try {

    if (
      characterInstance.current_health <= 0 ||
      enemyInstance.current_health <= 0
    ) {

      if (characterInstance.current_health > 0) {
        // Player won the battle
        await LevelUpSystem.levelUp(
          characterInstance.character_id,
          enemyInstance.enemy_id,
          interaction
        )
        await RewardsHandler.handleRewards(
          userId,
          characterInstance.character_id,
          enemyInstance.enemy_id,
          interaction
        )
      } else {
        // Player lost the battle
        characterInstance.consecutive_kill = 0
        const lossEmbed = new EmbedBuilder()
          .setColor('DarkRed')
          .setDescription(`${enemyInstance.character_name} wins.`)
        await interaction.followUp({ embeds: [lossEmbed] })
      }

      // Update consecutive kills, etc.
      // ...
    } 
  } catch (error) {
    console.error('Error in handleBattleEnd:', error)
  }

  // Clear battle from the manager
  delete battleManager[battleKey]
  delete userBattles[userId]
}

// Function to stop all cron jobs associated with a battle
function stopBattleCronJobs(battleKey) {
  const battle = battleManager[battleKey]
  if (battle) {
    [battle.characterInstance, battle.enemyInstance].forEach((character) => {
      if (character && character.cronTask) {
        character.cronTask.stop()
      }
    })
  }

  delete battleManager[battleKey]
  delete userBattles[battleKey]
}

// Battle logic and cron job setup
const setupBattleLogic = async (userId, userName, interaction) => {
  const validBattleKeys = Object.keys(battleManager).filter(
    (key) => key !== 'battleManager' && key !== 'userBattles'
  )

  if (validBattleKeys.length <= 0) return

  validBattleKeys.forEach((battleKey) => {
    const battle = battleManager[battleKey]
    if (!battle) return

    const { characterInstance, enemyInstance } = battle

    // Store userId in the battle object
    battle.userId = userId
    battle.userName = userName
    battle.battleEnded = false

    initializeCharacterFlagsAndCounters(characterInstance)
    initializeCharacterFlagsAndCounters(enemyInstance)

    setupCharacterCron(characterInstance, 'character', interaction, battleKey)
    setupCharacterCron(enemyInstance, 'enemy', interaction, battleKey)
  })
}

module.exports = { setupBattleLogic, applyDamage, applyCritDamage }
