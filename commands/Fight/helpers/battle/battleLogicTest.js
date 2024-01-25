const cron = require('node-cron')
const { EmbedBuilder } = require('discord.js')
const { battleManager, userBattles } = require('./battleManager')
const { traits, applyCritDamage } = require('../characterFiles/traits')
const LevelUpSystem = require('../characterFiles/levelUpSystem')
const RewardsHandler = require('../characterFiles/RewardsHandler')
const { createRoundEmbed } = require('./battleEmbeds')
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

  console.log(
    `APPLY DAMAGE: ${attacker.character_name} dealt ${bufferDamage} damage to ${defender.character_name}. Was it a critical? ${isCrit}.`
  )

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

const applyRound = async (
  actingCharacter,
  opposingCharacters,
  userName,
  interaction
) => {
  const actions = [];
  let actionResult;

  // Determine if the acting character is attacking the enemy or a backlane character stepping forward
  if (actingCharacter.role === 'enemy') {
    // Enemy attacks either Frontlane or Backlane Character
    let targetCharacter = opposingCharacters.frontlaneCharacter.current_health > 0
      ? opposingCharacters.frontlaneCharacter
      : opposingCharacters.backlaneCharacter;
    if (targetCharacter.current_health > 0) {
      actionResult = await applyDamage(actingCharacter, targetCharacter);
      actions.push(actionResult);
    }
  } else {
    // Frontlane or Backlane Character attacks Enemy
    if (actingCharacter.current_health > 0) {
      actionResult = await applyDamage(actingCharacter, opposingCharacters.enemy);
      actions.push(actionResult);
    }
  }

  // Create and send round summary embed
  const roundEmbed = createRoundEmbed(
    actions,
    userName,
    opposingCharacters.frontlaneCharacter,
    opposingCharacters.backlaneCharacter,
    opposingCharacters.enemy
  );

  await interaction.followUp({ embeds: [roundEmbed], ephemeral: true });
};

// Helper function to generate the opposing characters object
function getOpposingCharacters(battle, actingCharacterRole) {
  const opposingCharacters = {
    frontlaneCharacter: battle.frontlaneCharacterInstance,
    backlaneCharacter: battle.backlaneCharacterInstance,
    enemy: battle.enemyInstance
  };

  if (actingCharacterRole === 'frontlane' || actingCharacterRole === 'backlane') {
    delete opposingCharacters[actingCharacterRole];
  }

  return opposingCharacters;
}

// Updated handleCharacterAction function
async function handleCharacterAction(character, role, interaction, battleKey) {
  const battle = battleManager[battleKey];
  if (!battle) return;
console.log('character action')
  const opposingCharacters = getOpposingCharacters(battle, role);
  console.log('Actions', opposingCharacters, character, role, interaction, battleKey)
  await applyRound(
    character,
    opposingCharacters,
    battle.userName,
    interaction
  );

  // Check if the battle ends
  if (await battleEnds(character, role, battleKey)) {
    stopBattleCronJobs(battleKey);
  }
}

// BATTLE LOGIC
let initializedCharacters = {}

// Battle logic and cron job setup
const setupBattleLogic = async (userId, userName, interaction) => {
  const validBattleKeys = Object.keys(battleManager).filter(
    (key) => key !== 'battleManager' && key !== 'userBattles'
  )

  if (validBattleKeys.length <= 0) return

  validBattleKeys.forEach((battleKey) => {
    const battle = battleManager[battleKey]
    if (!battle) return
    // console.log('hi')

    const {
      frontlaneCharacterInstance,
      backlaneCharacterInstance,
      enemyInstance,
    } = battle

    initializeCharacterFlagsAndCounters(frontlaneCharacterInstance)
    initializeCharacterFlagsAndCounters(backlaneCharacterInstance)
    initializeCharacterFlagsAndCounters(enemyInstance)

    // Set up cron jobs for each character
    setupCharacterCron(
      frontlaneCharacterInstance,
      'frontlane',
      interaction,
      battleKey
    )
    setupCharacterCron(
      backlaneCharacterInstance,
      'backlane',
      interaction,
      battleKey
    )
    setupCharacterCron(enemyInstance, 'enemy', interaction, battleKey)
  })
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

// Function to set up a cron job for a character

const setupCharacterCron = (
  characterInstance,
  role,
  battleKey,
  interaction,
  userId
) => {
  const attackSpeed = calculateAttackSpeed(characterInstance) // Implement this function based on character attributes

  return cron.schedule(`*/${attackSpeed} * * * * *`, async () => {
    console.log('this is working')
    await handleCharacterAction(characterInstance, interaction)
    // Check if the battle ends
    if (battleEnds(battleKey)) {
      // If the battle ends, execute end-of-battle logic
      await handleBattleEnd(battleKey, interaction, userId)
      // Stop the cron job
      this.stop()
    }
  })
}

async function handleBattleEnd(battleKey, interaction, userId) {
  const battle = battleManager[battleKey]
  if (!battle) return

  const {
    frontlaneCharacterInstance,
    backlaneCharacterInstance,
    enemyInstance,
  } = battle

  // Logic for handling the end of the battle
  // For example, updating consecutive kills, leveling up, handling rewards, etc.
  // ...
  try {
    if (
      backlaneCharacterInstance.current_health <= 0 ||
      enemyInstance.current_health <= 0
    ) {
      if (backlaneCharacterInstance.current_health > 0) {
        // Characters survived the battle
        await LevelUpSystem.levelUp(
          frontlaneCharacterInstance.character_id,
          backlaneCharacterInstance.character_id,
          enemyInstance.enemy_id,
          interaction
        )
        await RewardsHandler.handleRewards(
          userId,
          frontlaneCharacterInstance.character_id,
          backlaneCharacterInstance.character_id,
          enemyInstance.enemy_id,
          interaction
        )
        // You might want to send a message indicating the battle result
      } else {
        frontlaneCharacterInstance.consecutive_kill = 0
        backlaneCharacterInstance.consecutive_kill = 0
        const lossEmbed = new EmbedBuilder()
          .setColor('DarkRed')
          .setDescription(`${enemyInstance.character_name} wins.`)
        await interaction.followUp({ embeds: [lossEmbed] })
      }

      // Update consecutive_kill value for the frontlane character
      try {
        await Character.update(
          { consecutive_kill: frontlaneCharacterInstance.consecutive_kill },
          {
            where: {
              character_id: frontlaneCharacterInstance.character_id,
            },
          }
        )
        console.log(
          'Successfully updated consecutive_kill for frontlane character.'
        )
      } catch (e) {
        console.error(
          'Failed to update consecutive_kill for frontlane character:',
          e
        )
      }

      // Update consecutive_kill value for the backlane character
      try {
        await Character.update(
          { consecutive_kill: backlaneCharacterInstance.consecutive_kill },
          {
            where: { character_id: backlaneCharacterInstance.character_id },
          }
        )
        console.log(
          'Successfully updated consecutive_kill for backlane character.'
        )
      } catch (e) {
        console.error(
          'Failed to update consecutive_kill for backlane character:',
          e
        )
      }
    }
  } catch (error) {
    console.error('Error handling battle end:', error)
  }

  // Clear battle from the manager
  delete battleManager[battleKey]
  delete userBattles[userId]
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

// Function to check if the battle has ended
async function battleEnds(character, role, battleKey) {
  const battle = battleManager[battleKey]
  if (!battle) return true

  if (
    backlaneCharacterInstance.current_health <= 0 ||
    enemyInstance.current_health <= 0
  ) {
    // Check if character survived the battle
    if (backlaneCharacterInstance.current_health > 0) {
      try {
        frontlaneCharacterInstance.consecutive_kill++
        backlaneCharacterInstance.consecutive_kill++
        await LevelUpSystem.levelUp(
          frontlaneCharacterInstance.character_id,
          backlaneCharacterInstance.character_id,
          enemyInstance.enemy_id,
          interaction
        )
        // Call RewardsHandler
        await RewardsHandler.handleRewards(
          userId,
          frontlaneCharacterInstance.character_id,
          backlaneCharacterInstance.character_id,
          enemyInstance.enemy_id,
          interaction
        )

        console.log('XP updated.') // Log on successful
      } catch (err) {
        console.log('XP update failed:', err) // Log if level up fails
      }
    } else {
      frontlaneCharacterInstance.consecutive_kill = 0
      backlaneCharacterInstance.consecutive_kill = 0
      const lossEmbed = new EmbedBuilder()
        .setColor('DarkRed')
        .setDescription(`${enemyInstance.character_name} wins.`)
      await interaction.followUp({ embeds: [lossEmbed] })
    }

    // Update consecutive_kill value for the frontlane character
    try {
      await Character.update(
        { consecutive_kill: frontlaneCharacterInstance.consecutive_kill },
        {
          where: {
            character_id: frontlaneCharacterInstance.character_id,
          },
        }
      )
      console.log(
        'Successfully updated consecutive_kill for frontlane character.'
      )
    } catch (e) {
      console.error(
        'Failed to update consecutive_kill for frontlane character:',
        e
      )
    }

    // Update consecutive_kill value for the backlane character
    try {
      await Character.update(
        { consecutive_kill: backlaneCharacterInstance.consecutive_kill },
        {
          where: { character_id: backlaneCharacterInstance.character_id },
        }
      )
      console.log(
        'Successfully updated consecutive_kill for backlane character.'
      )
    } catch (e) {
      console.error(
        'Failed to update consecutive_kill for backlane character:',
        e
      )
    }

    delete battleManager[battleKey]
    delete userBattles[userId]

    if (cronTask) {
      cronTask.stop()
    }
  }
}

// Function to stop all cron jobs associated with a battle
function stopBattleCronJobs(battleKey) {
  const battle = battleManager[battleKey]
  if (battle) {
    ;[
      battle.frontlaneCharacterInstance,
      battle.backlaneCharacterInstance,
      battle.enemyInstance,
    ].forEach((character) => {
      if (character && character.cronTask) {
        character.cronTask.stop()
      }
    })
  }

  delete battleManager[battleKey]
  delete userBattles[battleKey]
}

module.exports = { setupBattleLogic, applyDamage, applyCritDamage }
