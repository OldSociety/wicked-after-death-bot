const cron = require('node-cron')
const battleManager = require('./battleManager')

let cronJobStarted = false
let cronTask
const battleTicker = "MY_CUSTOM_ID"

function applyDamage(attacker, defender) {
  const randHit = Math.random() * 100
  if (randHit < attacker.chance_to_hit * 100) {
    const minDamage = attacker.effective_damage * 0.08 // Minimum 20% of effective_damage
    const maxDamage = attacker.effective_damage * 0.12 // Maximum 25% of effective_damage
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
  if (Object.keys(battleManager).length <= 1) {
    // console.log('No ongoing battles. Should have stopped cron job.');
    return;
  }

    cronTask = cron.schedule('*/5 * * * * *', () => {
      console.log('Battle Key:', JSON.stringify(Object.keys(battleManager)))
      if (Object.keys(battleManager).length <= 1) {
        // console.log('No ongoing battles. Stopping cron job.')
        delete battleManager[battleKey]
        // console.log('Current state of battleManager:', battleManager)
        return
      }

      // console.log('Current battles:', JSON.stringify(battleManager))


      Object.keys(battleManager).forEach((battleKey) => {
        const battle = battleManager[battleKey]
        if (!battle) return

        const { characterInstance, enemyInstance } = battle
        if (!characterInstance || !enemyInstance) return

        console.log("I'm working.")
        console.log('Player health before: ', characterInstance.current_health)
        console.log('Enemy health before: ', enemyInstance.current_health)
        applyDamage(characterInstance, enemyInstance)

        console.log('Enemy health after :', enemyInstance.current_health)
        applyDamage(enemyInstance, characterInstance)
        console.log('Player health', characterInstance.current_health)
        if (
          characterInstance.current_health <= 0 ||
          enemyInstance.current_health <= 0
        ) {
          console.log('Battle ends.');
          delete battleManager[battleKey];
          console.log(Object.keys(battleManager));
      
          if (Object.keys(battleManager).length <= 1) {
            // console.log('About to stop cron job.');
            cronTask.stop();
            // console.log('Cron job should have stopped.');
          }
        }
      })
    })
  }


// Run the setup function once to initiate the cron job
setupBattleLogic()

module.exports = { setupBattleLogic }
