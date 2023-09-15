const cron = require('node-cron')
const battleManager = require('./battleManager')

let cronJobStarted = false
let cronTask

function applyDamage(attacker, defender) {
  const randHit = Math.random() * 100
  if (randHit < (attacker.chance_to_hit * 100)) {
    const minDamage = attacker.effective_damage * 0.18 // Minimum 20% of effective_damage
    const maxDamage = attacker.effective_damage * 0.22 // Maximum 25% of effective_damage
    const actualDamage = Math.floor(
      Math.random() * (maxDamage - minDamage + 1) + minDamage
    )

    defender.current_health -= actualDamage
    console.log(
      `${attacker.character_name} hits ${defender.character_name} for ${actualDamage} damage.`
    )
  } else {
    console.log(`${attacker.character_name} misses.`)
  }
}

const setupBattleLogic = () => {
  if (cronJobStarted) return // If cron job already started, do nothing

  cronTask = cron.schedule('*/10 * * * * *', () => {
    if (Object.keys(battleManager).length === 0) {
      console.log('No ongoing battles. Stopping cron job.')
      cronTask.stop() // Stop the cron job
      cronJobStarted = false // Reset the flag
      console.log('Current state of battleManager:', battleManager)
      return
    }

    // if (Object.keys(battleManager).length > 1) {
      console.log('Current battles:', JSON.stringify(battleManager))
    // }

    Object.keys(battleManager).forEach((battleKey) => {
      const battle = battleManager[battleKey]
      if (!battle) return

      const { characterInstance, enemyInstance } = battle
      if (!characterInstance || !enemyInstance) return

      console.log("I'm working.")
      applyDamage(characterInstance, enemyInstance)
      applyDamage(enemyInstance, characterInstance)

      if (
        characterInstance.current_health <= 0 ||
        enemyInstance.current_health <= 0
      ) {
        console.log('Battle ends.')
        delete battleManager[battleKey]
        console.log('Battle should be deleted: ', battleManager)
        cronTask.stop() // Stop the cron job
        cronJobStarted = false // Reset the flag
      }
    })
  })

  cronJobStarted = true
}

// Run the setup function once to initiate the cron job
setupBattleLogic()

module.exports = { setupBattleLogic }
