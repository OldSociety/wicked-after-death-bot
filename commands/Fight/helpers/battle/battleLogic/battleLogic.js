const { battleManager, userBattles } = require('../battleManager')
const { setupCharacterCron } = require('./cronJobs')
const { initializeCharacterFlagsAndCounters } = require('./battleUtils')
const { createRoundEmbed } = require('../roundEmbed')
// const { SetupPlayerReactions } = require('./reactionListener')

const setupBattleLogic = async (userId, userName, i, deck) => {

  const validBattleKeys = Object.keys(battleManager).filter(
    (key) => key !== 'battleManager' && key !== 'userBattles'
  )

  if (validBattleKeys.length <= 0) return

  for (const battleKey of validBattleKeys) {
    const battle = battleManager[battleKey]
    if (!battle) continue

    const { characterInstance, enemyInstance } = battle

    // Store userId and other details in the battle object
    battle.userId = userId
    battle.userName = userName
    battle.battleEnded = false

    console.log(`Battle initiated for user ${userId} with battle key ${battleKey}.`);

    // Initialize character flags and counters
    initializeCharacterFlagsAndCounters(characterInstance)
    initializeCharacterFlagsAndCounters(enemyInstance)

    let actions = null

    // Player Embed
    const roundEmbed = createRoundEmbed(
      actions,
      characterInstance,
      enemyInstance,
      battleKey,
      deck
    )
    await i.editReply(roundEmbed)
  }
}

module.exports = { setupBattleLogic }
