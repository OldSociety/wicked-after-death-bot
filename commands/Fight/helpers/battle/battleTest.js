const cron = require('node-cron')
const { EmbedBuilder } = require('discord.js')
const { battleManager, userBattles } = require('./battleManager')
const { traits, applyCritDamage } = require('../characterFiles/traits')
const LevelUpSystem = require('../characterFiles/levelUpSystem')
const RewardsHandler = require('../characterFiles/rewardsHandler')
const { createRoundEmbed, createPlayerActionEmbed } = require('./roundEmbed')
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
  characterInstance,
  enemyInstance,
  interaction,
  battleKey
) => {
  // Create the initial embed for player's action
  const playerActionEmbed = createPlayerActionEmbed(characterInstance)
  const message = await interaction.followUp(playerActionEmbed)

  // Add reactions for available actions
  await message.react('⚔️') // Light attack emoji

  const actions = [] // This will store the player's actions

  const filter = (reaction, user) => user.id === interaction.user.id
  const collector = message.createReactionCollector({
    filter,
    max: 1,
    time: 60000,
  })

  collector.on('collect', async (reaction) => {
    if (reaction.emoji.name === '⚔️') {
      // Player chose light attack
      actions.push({
        type: 'light_attack',
        character: characterInstance,
        target: enemyInstance,
      })
    }
  })

  collector.on('end', async (collected) => {
    if (collected.size === 0) {
      interaction.followUp(
        `${characterInstance.character_name} hesitated, losing their turn.`
      )
    } else {
      // Process player's actions
      for (const action of actions) {
        // Apply damage or other effects based on action type
        await applyDamage(action.character, action.target)
      }

      // Process enemy action if enemy is still alive
      if (enemyInstance.current_health > 0) {
        await applyDamage(enemyInstance, characterInstance)
      }

      // Update the battle state and send a summary embed
      // ...

      // Proceed to the next turn
      applyRound(characterInstance, enemyInstance, interaction, battleKey)
    }
  })
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
