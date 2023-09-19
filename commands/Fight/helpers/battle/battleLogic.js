const cron = require('node-cron')
const battleManager = require('./battleManager')
const {Character} = require('../../../../Models/model')

let cronJobStarted = false
let cronTask
const battleTicker = 'MY_CUSTOM_ID'

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

function canParticipate(instance) {
  if (instance.recoveryTimestamp) {
    const currentTime = new Date().getTime()
    return currentTime > instance.recoveryTimestamp
  }
  return true
}

const setupBattleLogic = () => {
  if (Object.keys(battleManager).length <= 1) {
    // console.log('No ongoing battles. Should have stopped cron job.');
    return
  }

  cronTask = cron.schedule('*/5 * * * * *', async () => {
    console.log('Battle Key:', JSON.stringify(Object.keys(battleManager)))
    if (Object.keys(battleManager).length <= 1) {
      // console.log('No ongoing battles. Stopping cron job.')
      delete battleManager[battleKey]
      // console.log('Current state of battleManager:', battleManager)
      return
    }

    // console.log('Current battles:', JSON.stringify(battleManager))

    function canParticipate(instance) {
      if (instance.recoveryTimestamp) {
        const currentTime = new Date().getTime()
        return currentTime > instance.recoveryTimestamp
      }
      return true
    }

    Object.keys(battleManager).forEach(async (battleKey) => {
      const battle = battleManager[battleKey]
      if (!battle) return

      const { characterInstance, enemyInstance } = battle
      if (!characterInstance || !enemyInstance) return

      if (
        !canParticipate(characterInstance)
      ) {
        console.log('Character is in recovery mode.')
        return
      }

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
        console.log('Battle ends.')


          const recoveryTime = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now


        // Update the database records
        if (characterInstance.current_health <= 0) {
          console.log("Your character needs to recover.")
          await Character.update(
            { recovery_timestamp: recoveryTime },
            { where: { character_id: characterInstance.character_id } }
          )
        }

        delete battleManager[battleKey]
        console.log(Object.keys(battleManager))

        if (Object.keys(battleManager).length <= 1) {
          // console.log('About to stop cron job.');
          cronTask.stop()
          // console.log('Cron job should have stopped.');
        }
      }
    })
  })
}

// Run the setup function once to initiate the cron job
setupBattleLogic()

module.exports = { setupBattleLogic }
