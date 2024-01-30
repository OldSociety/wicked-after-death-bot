const { battleManager, userBattles } = require('../battleManager')
const { setupCharacterCron } = require('./cronJobs')
const { initializeCharacterFlagsAndCounters } = require('./battleUtils')
const { createPlayerActionEmbed } = require('../roundEmbed')
const { handleCharacterAction } = require('./characterActions')

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
    setupCharacterCron(characterInstance, 'character', interaction, battleKey)
    setupCharacterCron(enemyInstance, 'enemy', interaction, battleKey)

    // Wait for a brief moment before sending the initial embed
    setTimeout(async () => {
      const playerActionEmbed = createPlayerActionEmbed(characterInstance)
      const message = await interaction.followUp(playerActionEmbed)

      // Add button interaction collector
      const filter = (i) =>
        i.customId === 'light_attack' && i.user.id === userId
      const collector = message.createMessageComponentCollector({
        filter,
        time: 60000,
      })

      collector.on('collect', async (i) => {
        if (i.customId === 'light_attack' && i.message.embeds.length > 0) {
          const embed = i.message.embeds[0]
          if (embed && embed.title) {
            // Accessing the title of the embed, ensure embed is defined
            console.log(embed.title)
          }
          await i.update({ content: 'Light Attack selected!', components: [] })
        }
      })

      collector.on('end', (collected) => {
        if (collected.size === 0) {
          interaction.followUp('No action selected, skipping turn.')
        }
      })
    }, 2000)
  }
}
module.exports = { setupBattleLogic }
