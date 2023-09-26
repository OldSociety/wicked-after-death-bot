const cron = require('node-cron')
const { EmbedBuilder } = require('discord.js')
const { battleManager, userBattles } = require('./battleManager')
const { Character } = require('../../../../Models/model')
const { traits, applyCritDamage } = require('../characterFiles/traits')
const LevelUpSystem = require('../characterFiles/levelUpSystem')
const { createRoundEmbed } = require('./battleEmbeds')
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
  const randHit = Math.random() * 100;
  let isCrit = false,
    didMiss = false,
    actualDamage,
    bufferDamage = 0; // Initialize bufferDamage to 0

  if (randHit < attacker.chance_to_hit * 100) {
    // Attack hits
    let [minDamage, maxDamage, isCrit] = calcDamage(attacker, randHit);

    actualDamage = calcActualDamage(minDamage, maxDamage);
    bufferDamage = Math.min(actualDamage, defender.buffer_health);

    updateBufferHealth(defender, bufferDamage);
    updateHealth(defender, actualDamage - bufferDamage);

    
  } else {
    // Attack misses
    didMiss = true;
  }

  if (isCrit && traits[defender.character_name]?.onCritReceived) {
    const reactiveDamage = traits[defender.character_name].onCritReceived(defender, attacker);
    if (reactiveDamage !== null) {
      actualDamage = reactiveDamage; // Update the actualDamage value
    }
  }

  return compileDamageResult(
    attacker,
    defender,
    actualDamage,
    bufferDamage,
    isCrit,
    didMiss
  );
}


// ROUND LOGIC
const applyRound = async (character, enemy, userName, interaction, turnNum) => {
  // Step 1: Check specials
  await checkSpecialTrigger(character, character.activeSpecials)
  // await checkSpecialTrigger(enemy, specialsArray)

  // Step 2: Execute specials
  for (const specialId of character.activeSpecials) {
    await executeSpecial(character, { id: specialId })
  }
  // for (const specialId of enemy.activeSpecials) {
  //   await executeSpecial(enemy, { id: specialId })
  // }

  const actions = []

  const action1 = await applyDamage(character, enemy)
  actions.push(action1)

  // Check if enemy's health is already <= 0, if not, proceed with defender's attack
  if (enemy.current_health > 0) {
    const action2 = await applyDamage(enemy, character)
    actions.push(action2)
  }

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
let initializedCharacters = {};

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
          initializeCharacterFlagsAndCounters(characterInstance);
          initializedCharacters[characterInstance.character_id] = true;
        }
    
        if (!initializedCharacters[enemyInstance.character_id]) {
          initializeCharacterFlagsAndCounters(enemyInstance);
          initializedCharacters[enemyInstance.character_id] = true;
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
                enemyInstance.id,
                interaction
              )
              console.log('XP updated.') // Log on successful
            } catch (err) {
              console.log('XP update failed:', err) // Log if level up fails
            }
          } else {
            characterInstance.consecutive_kill = 0
            const winEmbed = new EmbedBuilder().setDescription(
              `${enemyInstance.character_name} wins.`
            )
            await interaction.followUp({ embeds: [winEmbed] })
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
