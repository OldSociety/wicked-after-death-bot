const { createRoundEmbed } = require('../roundEmbed')
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
const applyRound = async (attacker, defender, interaction, battleKey) => {
  if (attacker.current_health > 0 && defender.current_health > 0) {
    const actionResult = await applyDamage(attacker, defender)
    const actions = [actionResult]
    const roundEmbedObject = createRoundEmbed(
      actions,
      attacker,
      defender,
      battleKey
    )

    try {
      await interaction.reply({ ...roundEmbedObject })
    } catch (error) {
      console.error('Error in initial interaction reply:', error)
    }

    // Check if the battle should end
    if (attacker.current_health <= 0 || defender.current_health <= 0) {
      // End the battle
      return true
    }
    // Continue the battle
    return false
  } else {
    // End the battle because one of the characters has zero health
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

    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton()) return

      if (interaction.customId === 'light_attack') {
        // Acknowledge the interaction before processing
        await interaction.deferReply()

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
