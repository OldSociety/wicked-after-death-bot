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
const { handleBattleEnd, stopBattleCronJobs } = require('./battleEndHandlers')

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
  const battle = battleManager[battleKey]
  if (!battle) {
    console.error('Battle not found for key:', battleKey)
    // Additional debug info
    console.log('Current battles in manager:', Object.keys(battleManager))
    return // Battle not found
  }

  if (!battle || battle.battleEnded) return // Check if battle has ended

  const defender =
    role === 'enemy' ? battle.characterInstance : battle.enemyInstance
  const battleEnded = await applyRound(
    character,
    defender,
    battle.userName,
    interaction
  )

  // Check if the battle ends and ensure it's only processed once
  if (battleEnded && !battle.battleEnded) {
    battle.battleEnded = true // Prevents double execution

    try {
      await handleBattleEnd(battleKey, interaction, battle.characterInstance, battle.enemyInstance)
    } catch (error) {
      console.log('handlebattleEnd error: ', error)
    }

    stopBattleCronJobs(battleKey)
  }
}

module.exports = { applyDamage, applyRound, handleCharacterAction }
