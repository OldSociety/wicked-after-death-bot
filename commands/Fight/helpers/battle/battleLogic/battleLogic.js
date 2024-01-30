const { battleManager, userBattles } = require('../battleManager')
const { setupCharacterCron } = require('./cronJobs');
const { initializeCharacterFlagsAndCounters } = require('./battleUtils');



// Battle logic and cron job setup
const setupBattleLogic = async (userId, userName, interaction) => {
  const validBattleKeys = Object.keys(battleManager).filter(
    (key) => key !== 'battleManager' && key !== 'userBattles'
  )

  if (validBattleKeys.length <= 0) return

  validBattleKeys.forEach((battleKey) => {
    const battle = battleManager[battleKey]
    if (!battle) return

    const { characterInstance, enemyInstance } = battle

    // Store userId in the battle object
    battle.userId = userId
    battle.userName = userName
    battle.battleEnded = false

    initializeCharacterFlagsAndCounters(characterInstance)
    initializeCharacterFlagsAndCounters(enemyInstance)

    

    setupCharacterCron(characterInstance, 'character', interaction, battleKey)
    setupCharacterCron(enemyInstance, 'enemy', interaction, battleKey)
  })
}

module.exports = { setupBattleLogic }
