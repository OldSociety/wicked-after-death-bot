const { battleManager, userBattles } = require('../battleManager')
const { setupCharacterCron } = require('./cronJobs')
const { initializeCharacterFlagsAndCounters } = require('./battleUtils')
const { createPlayerActionEmbed } = require('../roundEmbed')
const { SetupPlayerReactions } = require('./reactionListener')

const setupBattleLogic = async (userId, userName, interaction) => {
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

    // Initialize character flags and counters
    initializeCharacterFlagsAndCounters(characterInstance)
    initializeCharacterFlagsAndCounters(enemyInstance)

    // Setup cron jobs
    setupCharacterCron(enemyInstance, 'enemy', interaction, battleKey) // Only for enemy

    // Delay the initial player action embed display
    setTimeout(async () => {
      const playerActionEmbed = createPlayerActionEmbed(characterInstance, battleKey)
      await interaction.followUp(playerActionEmbed)
    }, 1000) // Delay of (1 second)
  }
}

module.exports = { setupBattleLogic }
