const cron = require('node-cron')
const { EmbedBuilder } = require('discord.js')
const { battleManager, userBattles } = require('./battleManager')
const { Character } = require('../../../../Models/model')
const { traits, applyCritDamage } = require('../characterFiles/traits')
const LevelUpSystem = require('../characterFiles/levelUpSystem')
const { createRoundEmbed } = require('./battleEmbeds')

let cronTask = null

async function applyDamage(attacker, defender, userId) {
  // const user = await client.users.fetch(userId);
  const startingHealth = defender.current_health
  const randHit = Math.random() * 100
  let isCrit = false,
    didMiss = false,
    actualDamage,
    bufferDamage = 0 // Initialize bufferDamage to 0

  if (randHit < attacker.chance_to_hit * 100) {
    let [minDamage, maxDamage] = calcDamage(attacker, randHit)

    actualDamage = calcActualDamage(minDamage, maxDamage)
    const bufferDamage = Math.min(actualDamage, defender.buffer_health)

    updateBufferHealth(defender, bufferDamage)
    updateHealth(defender, actualDamage - bufferDamage)
  } else {
    didMiss = true
  }

  if (isCrit && traits[defender.character_name]?.onCritReceived) {
    traits[defender.character_name].onCritReceived(defender, attacker)
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

function calcDamage(attacker, randHit) {
  let minDamage = Math.round(attacker.effective_damage * 0.08)
  let maxDamage = Math.round(attacker.effective_damage * 0.12)

  if (randHit < attacker.crit_chance * 100) {
    isCrit = true
    minDamage *= 1.5
    maxDamage *= 1.5
  }

  return [minDamage, maxDamage]
}

function calcActualDamage(minDamage, maxDamage) {
  return Math.floor(Math.random() * (maxDamage - minDamage + 1) + minDamage)
}

function updateBufferHealth(defender, bufferDamage) {
  if (defender.buffer_health > 0) {
    defender.buffer_health = Math.max(0, defender.buffer_health - bufferDamage)
  }
}

function updateHealth(defender, damageTaken) {
  defender.current_health = Math.max(0, defender.current_health - damageTaken)
}

function compileDamageResult(
  attacker,
  defender,
  actualDamage,
  bufferDamage,
  isCrit,
  didMiss
) {
  return {
    attacker,
    defender,
    actualDamage,
    bufferDamage,
    isCrit,
    didMiss,
  }
}

const applyRound = async (character, enemy, userName, interaction) => {
  const actions = []

  const action1 = await applyDamage(character, enemy)
  actions.push(action1)

  // Check if enemy's health is already <= 0, if not, proceed with defender's attack
  if (enemy.current_health > 0) {
    const action2 = await applyDamage(enemy, character);
    actions.push(action2);
  }

  const roundEmbed = createRoundEmbed(actions, userName, character, enemy)
  await interaction.followUp({ embeds: [roundEmbed], ephemeral: true })
}

const setupBattleLogic = async (userId, userName, interaction) => {
  // const user = await client.users.fetch(userId)
  const validBattleKeys = Object.keys(battleManager).filter(
    (key) => key !== 'battleManager' && key !== 'userBattles'
  )

  if (validBattleKeys.length <= 0) return

  const cronTask = cron.schedule('*/15 * * * * *', async () => {
    if (validBattleKeys.length <= 0) {
      cronTask.stop()
      return
    }

    try {
      for (const battleKey of validBattleKeys) {
        const battle = battleManager[battleKey]

        if (!battle) continue

        const { characterInstance, enemyInstance } = battle

        if (!characterInstance || !enemyInstance) continue

        // Apply damage and handle battles here

        await applyRound(
          characterInstance,
          enemyInstance,
          userName,
          interaction
        )

        // Check for battle results and perform necessary actions
        if (
          characterInstance.current_health <= 0 ||
          enemyInstance.current_health <= 0
        ) {
          // Check if character survived the battle
          if (characterInstance.current_health > 0) {
            try {
              await LevelUpSystem.levelUp(
                characterInstance.character_id,
                enemyInstance.id
              )
              console.log('XP updated.') // Log on successful
            } catch (err) {
              console.log('XP update failed:', err) // Log if level up fails
            }

            // Increment consecutive_kill counter
            characterInstance.consecutive_kill += 1
          } else {
            // Reset consecutive_kill counter
            characterInstance.consecutive_kill = 0
          }

          // Save updated consecutive_kill value to the database
          try {
            await Character.update(
              { consecutive_kill: characterInstance.consecutive_kill },
              { where: { character_id: characterInstance.character_id } }
            )
            console.log(
              'Successfully updated consecutive_kill counter in the database.'
            ) // Log on successful update
          } catch (e) {
            console.error('Failed to update consecutive_kill:', e) // Log on failed update
          }

          // Check if enemy survived the battle
          if (enemyInstance.current_health > 0) {
            const winEmbed = new EmbedBuilder().setDescription(
              `${enemyInstance.character_name} wins.`
            )

            await interaction.followUp({ embeds: [winEmbed], ephemeral: true })
          } else {
            const critEmbed = new EmbedBuilder().setDescription(
              `${characterInstance.character_name} wins.`
            )

            await interaction.followUp({ embeds: [critEmbed], ephemeral: true })
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
