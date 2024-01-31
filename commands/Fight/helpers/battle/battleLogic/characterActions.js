const { createRoundEmbed, createPlayerActionEmbed } = require('../roundEmbed')
const { traits, applyCritDamage } = require('../../characterFiles/traits')
const { battleManager } = require('../battleManager')
const {
  calcDamage,
  calcActualDamage,
  updateBufferHealth,
  updateHealth,
  compileDamageResult,
} = require('../applyDamageHelpers')

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
    console.log('miss', actualDamage)
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
const applyRound = async (
  attacker,
  defender,
  role,
  userName,
  channel,
  interaction = null
) => {
  console.log(attacker)
  if (attacker.current_health > 0 && defender.current_health > 0) {
    const actionResult = await applyDamage(attacker, defender)
    console.log('actions result: ', actionResult)
    const actions = [actionResult]
    console.log('actions: ', actions)
    const roundEmbed = createRoundEmbed(actions, userName, attacker, defender)
    console.log('role: ', role)

    // If the attacker is the enemy, send the embed to the channel
    if (role === 'enemy') {
      console.log(role)
      try {
        await channel.send({ embeds: [roundEmbed] })
      } catch (error) {
        console.error('Error sending round embed to channel:', error)
      }
    }
    // If the attacker is the player, reply to the interaction
    else if (interaction) {
      try {
        await interaction.reply({ embeds: [roundEmbed], ephemeral: true })
      } catch (error) {
        console.error('Error in interaction reply:', error)
      }
    }

    // Check if the battle should end
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
  const battle = battleManager[battleKey]
  if (!battle || battle.battleEnded) return

  if (role === 'character') {
    // Player's turn
    const message = await interaction.followUp(
      createPlayerActionEmbed(character)
    )
    // ... existing code for setting up collector ...

    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton()) return

      if (interaction.customId === 'light_attack') {
        // Acknowledge the interaction before processing
        await interaction.deferReply() // or interaction.reply({ content: "Processing...", ephemeral: true });

        // The light attack button was pressed
        await applyDamage(character, battle.enemyInstance)

        // Respond to the interaction
        await interaction.followUp(
          `${character.character_name} attacks with a light strike!`
        )
      }
    })
  } else {
    // Enemy logic
    // ... existing enemy logic ...
  }
}

module.exports = { applyDamage, applyRound, handleCharacterAction }
