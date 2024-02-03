const cron = require('node-cron')
const { EmbedBuilder } = require('discord.js')
const { battleManager, userBattles } = require('../helpers/battle/battleManager')
const { traits, applyCritDamage } = require('../helpers/characterFiles/traits')
const LevelUpSystem = require('../helpers/characterFiles/levelUpSystem')
const RewardsHandler = require('../helpers/characterFiles/rewardsHandler')
const { createRoundEmbed } = require('../helpers/battle/roundEmbed')
const { Character } = require('../../../Models/model') // Adjust the path as needed
const {
  calcDamage,
  calcActualDamage,
  updateBufferHealth,
  updateHealth,
  compileDamageResult,
} = require('../helpers/battle/applyDamageHelpers')

const { checkSpecialTrigger, executeSpecial } = require('../helpers/battle/executeSpecial')

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

const applyRound = async (character, enemy, userName, interaction, turnNum) => {
  console.log('Interaction:', interaction);
console.log('Type of Interaction:', typeof interaction);
console.log('Interaction methods:', Object.keys(interaction));

  // // Step 1: Check specials
  // await checkSpecialTrigger(character, character.activeSpecials)
  // // await checkSpecialTrigger(enemy, specialsArray)

  // // Step 2: Execute specials
  // for (const specialId of character.activeSpecials) {
  //   await executeSpecial(character, { id: specialId })
  // }
  // for (const specialId of enemy.activeSpecials) {
  //   await executeSpecial(enemy, { id: specialId })
  // }

  const actions = []

  // Frontlane Character attacks Enemy
  if (character.current_health > 0) {
    const action1 = await applyDamage(character, enemy)
    actions.push(action1)
  }

  // Enemy attacks character
  if (enemy.current_health > 0) {
    const actionEnemy = await applyDamage(enemy, character)
    actions.push(actionEnemy)
  }

  // Create and send round summary embed
  const roundEmbed = createRoundEmbed(
    actions,
    userName,
    character,
    enemy,
    turnNum
  )

  await interaction.followUp({ embeds: [roundEmbed], ephemeral: true })
}

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

// BATTLE LOGIC
let turnNum = 1
let initializedCharacters = {}

const setupBattleLogic = async (userId, userName, interaction) => {
  // const user = await client.users.fetch(userId)
  console.log('Type of Interaction:', typeof interaction);
  console.log('Interaction methods:', Object.keys(interaction));
  const validBattleKeys = Object.keys(battleManager).filter(
    (key) => key !== 'battleManager' && key !== 'userBattles'
  )

  if (validBattleKeys.length <= 0) return

  const cronTask = cron.schedule('*/8 * * * * *', async () => {
    if (validBattleKeys.length <= 0) {
      cronTask.stop()
      return
    }

    try {
      for (const battleKey of validBattleKeys) {
        const battle = battleManager[battleKey]

        if (!battle) continue

        const { characterInstance, enemyInstance } = battle

        if (!initializedCharacters[characterInstance.character_id]) {
          initializeCharacterFlagsAndCounters(characterInstance)
          initializedCharacters[characterInstance.character_id] = true
        }

        if (!initializedCharacters[enemyInstance.character_id]) {
          initializeCharacterFlagsAndCounters(enemyInstance)
          initializedCharacters[enemyInstance.character_id] = true
        }

        if (!characterInstance || !enemyInstance) continue

        // Apply damage and handle battles here

        await applyRound(
          characterInstance,
          enemyInstance,
          userName,
          interaction,
          turnNum // Pass turnNum here
        )

        turnNum++ // Increment the turn number

        // Check for battle results and perform necessary actions
        if (
          characterInstance.current_health <= 0 ||
          enemyInstance.current_health <= 0
        ) {
          // Check if character survived the battle
          if (characterInstance.current_health > 0) {
            try {
              characterInstance.consecutive_kill++
              await LevelUpSystem.levelUp(
                characterInstance.character_id,
                enemyInstance.enemy_id,
                interaction
              )
              // Call RewardsHandler
              await RewardsHandler.handleRewards(
                userId,
                characterInstance.character_id,
                enemyInstance.enemy_id,
                interaction
              )

              console.log('XP updated.') // Log on successful
            } catch (err) {
              console.log('XP update failed:', err) // Log if level up fails
            }
          } else {
            characterInstance.consecutive_kill = 0
            const lossEmbed = new EmbedBuilder()
              .setColor('DarkRed')
              .setDescription(`${enemyInstance.character_name} wins.`)
            await interaction.followUp({ embeds: [lossEmbed] })
          }

          // Update consecutive_kill value for the frontlane character
          try {
            await Character.update(
              { consecutive_kill: characterInstance.consecutive_kill },
              {
                where: {
                  character_id: characterInstance.character_id,
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

          delete battleManager[battleKey]
          delete userBattles[userId]

          if (cronTask) {
            cronTask.stop()
          }
          turnNum = 1
        }
      }
    } catch (error) {
      console.error('An error occurred:', error)
    }
  })

  // Start the cron job
  cronTask.start()
}

module.exports = { setupBattleLogic, applyDamage, applyCritDamage }
