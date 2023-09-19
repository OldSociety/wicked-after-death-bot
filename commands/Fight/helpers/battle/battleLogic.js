const cron = require('node-cron')
const battleManager = require('./battleManager')
const { Character } = require('../../../../Models/model')
const { traits, applyCritDamage } = require('../characterFiles/traits')

let cronTask

function applyDamage(attacker, defender) {
  // Store the defender's starting health before the attack
  const startingHealth = defender.current_health

  const randHit = Math.random() * 100
  let isCrit = false
  let actualDamage

  if (randHit < attacker.chance_to_hit * 100) {
    let minDamage = attacker.effective_damage * 0.08
    let maxDamage = attacker.effective_damage * 0.12

    if (randHit < attacker.crit_chance * 100) {
      console.log(`${attacker.character_name} landed a critical hit!`)
      isCrit = true
      minDamage *= 1.5
      maxDamage *= 1.5
    }

    actualDamage = Math.floor(
      Math.random() * (maxDamage - minDamage + 1) + minDamage
    )

    const bufferDamage = Math.min(actualDamage, defender.buffer_health)
    // Subtract bufferDamage from buffer_health only if buffer health is available
    if (defender.buffer_health > 0) {
      defender.buffer_health = Math.max(0, defender.buffer_health - bufferDamage);
    }
    

    // Calculate the actual damage taken after considering the buffer
    const damageTaken = actualDamage - bufferDamage

    // Calculate the resulting health
    defender.current_health = Math.max(0, defender.current_health - damageTaken)

    // Calculate the change in starting health
    const healthChange = startingHealth - defender.current_health

    if (defender.character_name === 'Huntsman Hyrum') {
    console.log(`Debug: Starting Health: ${startingHealth}`)
    console.log(`Debug: Attacker's Full Damage: ${actualDamage}`)
    console.log(`Debug: Buffer Health: ${defender.buffer_health}`)
    console.log(`Debug: Buffer Damage: ${bufferDamage}`)
    console.log(`Debug: Actual Damage Taken: ${damageTaken}`)
    console.log(`Debug: Resulting Health: ${defender.current_health}`)
    console.log(`Debug: Change in Starting Health: ${healthChange}`)
    }
  } else {
    console.log(`${attacker.character_name} misses.`)
    return
  }
  if (isCrit && traits[defender.character_name]?.onCritReceived) {
    traits[defender.character_name].onCritReceived(defender, attacker)
  }
}

const setupBattleLogic = () => {
  if (Object.keys(battleManager).length <= 1) return

  cronTask = cron.schedule('*/10 * * * * *', async () => {
    if (Object.keys(battleManager).length <= 1) {
      cronTask.stop()
      return
    }
    console.log(Object.keys(battleManager).length)
    console.log(Object.keys(battleManager))
    for (const battleKey of Object.keys(battleManager)) {
      const battle = battleManager[battleKey]
      if (!battle) continue

      const { characterInstance, enemyInstance } = battle
      if (!characterInstance || !enemyInstance) continue

      console.log('Character Health Before: ', characterInstance.current_health)
      console.log('Enemy Health Before: ', enemyInstance.current_health)
      applyDamage(characterInstance, enemyInstance)
      applyDamage(enemyInstance, characterInstance)
      console.log('Character Health After: ', characterInstance.current_health)
      console.log('Enemy Health After: ', enemyInstance.current_health)

      if (
        characterInstance.current_health <= 0 ||
        enemyInstance.current_health <= 0
      ) {
        console.log('Battle ends.')
        delete battleManager[battleKey]

        if (Object.keys(battleManager).length <= 1) {
          cronTask.stop()
        }
      }
    }
  })
}

// Run the setup function once to initiate the cron job
setupBattleLogic()

module.exports = { setupBattleLogic }
