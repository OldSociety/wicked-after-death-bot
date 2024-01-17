// fightSelection.js
const { StandardFight, Enemy } = require('../../../Models/model')
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js')

async function selectfight(interaction) {
  try {
    const fights = await StandardFight.findAll({
      where: { raid_id: raidId },
      include: [Enemy], // Include Enemy data
    })

    if (!fights.length) {
      await interaction.reply('There are currently no fights available.')
      return null
    }

    const fightEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Choose Your fight')
      .setDescription('Select a fight to start your adventure.')

    const fightSelectMenu = new StringSelectMenuBuilder()
      .setCustomId('fightSelect')
      .setPlaceholder('Select a fight')
      .addOptions(
        fights.map((fight) => ({
          label: fight.character_name,
          description: fight.description,
          value: fight.fight_id.toString(),
        }))
      )

    const actionRow = new ActionRowBuilder().addComponents(fightSelectMenu)

    await interaction.reply({
      embeds: [fightEmbed],
      components: [actionRow],
      ephemeral: true,
    })

    const filter = (i) =>
      i.customId === 'fightSelect' && i.user.id === interaction.user.id
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 15000,
    })

    return new Promise((resolve) => {
      collector.on('collect', async (i) => {
        const selectedFightId = i.values[0]
        const selectedFight = fights.find(
          (fight) => fight.fight_id.toString() === selectedFightId
        )

        // Check if the fight has associated enemy data
        if (!selectedFight || !selectedFight.Enemy) {
          await i.update({
            content: 'Error: No enemy data found for this fight.',
            components: [],
          })
          resolve(null)
          return
        }

        // Return both selected fight ID and enemy data
        await i.update({
          content: `You have selected Fight ${selectedFightId}.`,
          components: [],
        })
        resolve({ fightId: selectedFightId, enemy: selectedFight.Enemy })
      })

      collector.on('end', (collected) => {
        if (!collected.size) {
          interaction.followUp('No fight was selected.')
          resolve(null)
        }
      })
    })
  } catch (error) {
    console.error(error)
    await interaction.reply('Something went wrong while fetching fights.')
    return null
  }
}

module.exports = { selectfight }
