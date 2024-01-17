const cron = require('node-cron')
const { EmbedBuilder } = require('discord.js')
const { battleManager, userBattles } = require('./battleManager')
const { traits, applyCritDamage } = require('../characterFiles/traits')
const LevelUpSystem = require('../characterFiles/levelUpSystem')
const { createRoundEmbed } = require('./battleEmbeds')
const { Character } = require('../../../../Models/model'); // Adjust the path as needed
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
  // console.log('check for working code', attacker, defender)
  const randHit = Math.random() * 100
  let isCrit = false,
    didMiss = false,
    actualDamage,
    bufferDamage = 0 // Initialize bufferDamage to 0

  if (randHit < attacker.chance_to_hit * 100) {
    // Attack hits
    console.log('About to call calcDamage') // Add this
    ;[minDamage, maxDamage, isCrit] = calcDamage(attacker, randHit)
    console.log(
      'Received values from calcDamage:',
      minDamage,
      maxDamage,
      isCrit
    )

    // Apply Traits
    if (traits[defender.character_name]) {
      traits[defender.character_name](defender, isCrit, attacker)
    }

    actualDamage = calcActualDamage(minDamage, maxDamage)
    bufferDamage = Math.min(actualDamage, defender.buffer_health)

    updateBufferHealth(defender, bufferDamage)
    updateHealth(defender, actualDamage - bufferDamage)
    console.log(`ERROR:`, defender.current_health)
  } else {
    // Attack misses
    didMiss = true
  }

  return compileDamageResult(
    attacker,
    defender,
    actualDamage,
    bufferDamage,
    isCrit,
    didMiss
  )
}

// ROUND LOGIC
const applyRound = async (
  frontlaneCharacter,
  backlaneCharacter,
  enemy,
  userName,
  interaction,
  turnNum
) => {
  // // Step 1: Check specials
  // await checkSpecialTrigger(frontlaneCharacter, frontlaneCharacter.activeSpecials)
  // await checkSpecialTrigger(backlaneCharacter, backlaneCharacter.activeSpecials)
  // // await checkSpecialTrigger(enemy, specialsArray)

  // // Step 2: Execute specials
  // for (const specialId of frontlaneCharacter.activeSpecials) {
  //   await executeSpecial(frontlaneCharacter, { id: specialId })
  // }
  // for (const specialId of backlaneCharacter.activeSpecials) {
  //   await executeSpecial(backlaneCharacter, { id: specialId })
  // }
  // for (const specialId of enemy.activeSpecials) {
  //   await executeSpecial(enemy, { id: specialId })
  // }

  const actions = []

  // Frontlane Character attacks Enemy
  if (frontlaneCharacter.current_health > 0) {
    const action1 = await applyDamage(frontlaneCharacter, enemy)
    actions.push(action1)
  }

  // Backlane Character attacks Enemy, but only if Frontlane Character has fallen
  if (
    frontlaneCharacter.current_health <= 0 &&
    backlaneCharacter.current_health > 0
  ) {
    const action2 = await applyDamage(backlaneCharacter, enemy)
    actions.push(action2)
  }

  // Enemy attacks Frontlane or Backlane Character
  if (enemy.current_health > 0) {
    let targetCharacter =
      frontlaneCharacter.current_health > 0
        ? frontlaneCharacter
        : backlaneCharacter
    const actionEnemy = await applyDamage(enemy, targetCharacter)
    actions.push(actionEnemy)
  }

  // Create and send round summary embed
  const roundEmbed = createRoundEmbed(
    actions,
    userName,
    frontlaneCharacter,
    backlaneCharacter,
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

        const {
          frontlaneCharacterInstance,
          backlaneCharacterInstance,
          enemyInstance,
        } = battle

        if (!initializedCharacters[frontlaneCharacterInstance.character_id]) {
          initializeCharacterFlagsAndCounters(frontlaneCharacterInstance)
          initializedCharacters[frontlaneCharacterInstance.character_id] = true
        }

        if (!initializedCharacters[backlaneCharacterInstance.character_id]) {
          initializeCharacterFlagsAndCounters(backlaneCharacterInstance)
          initializedCharacters[backlaneCharacterInstance.character_id] = true
        }

        if (!initializedCharacters[enemyInstance.character_id]) {
          initializeCharacterFlagsAndCounters(enemyInstance)
          initializedCharacters[enemyInstance.character_id] = true
        }

        if (
          !frontlaneCharacterInstance ||
          !backlaneCharacterInstance ||
          !enemyInstance
        )
          continue

        // Apply damage and handle battles here

        await applyRound(
          frontlaneCharacterInstance,
          backlaneCharacterInstance,
          enemyInstance,
          userName,
          interaction,
          turnNum // Pass turnNum here
        )

        turnNum++ // Increment the turn number

        // Check for battle results and perform necessary actions
        if (
          backlaneCharacterInstance.current_health <= 0 ||
          enemyInstance.current_health <= 0
        ) {
          // Check if character survived the battle
          if (backlaneCharacterInstance.current_health > 0) {
            try {
              // characterInstance.consecutive_kill++
              await LevelUpSystem.levelUp(
                frontlaneCharacterInstance.character_id,
                backlaneCharacterInstance.character_id,
                enemyInstance.id,
                interaction
              )
              console.log('XP updated.') // Log on successful
            } catch (err) {
              console.log('XP update failed:', err) // Log if level up fails
            }
          } else {
            // characterInstance.consecutive_kill = 0
            const winEmbed = new EmbedBuilder().setDescription(
              `${enemyInstance.character_name} wins.`
            )
            await interaction.followUp({ embeds: [winEmbed] })
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
    } catch (error) {
      console.error('An error occurred:', error)
    }
  })

  // Start the cron job
  cronTask.start()
}

module.exports = { setupBattleLogic, applyDamage, applyCritDamage }
