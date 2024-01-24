// fightSelection.js
const { StandardFight, Enemy } = require('../../../../Models/model')
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js')

async function selectFight(interaction, raidId) {
  try {
    const fights = await StandardFight.findAll({ where: { raid_id: raidId } })

    if (fights.length === 0) {
      await interaction.editReply('There are currently no fights available.')
      return null
    }

    const fightEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Choose Your Fight')
      .setDescription('Select a fight to start your adventure.')

    const fightSelectMenu = new StringSelectMenuBuilder()
      .setCustomId('fightSelect')
      .setPlaceholder('Select a fight')
      .addOptions(
        fights.map((fight) => ({
          label: `${fight.fight_name}`,
          value: fight.fight_id.toString(),
        }))
      )

    const actionRow = new ActionRowBuilder().addComponents(fightSelectMenu)

    await interaction.editReply({
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

        if (!selectedFight) {
          await interaction.followUp('Error: Fight not found.')
          resolve(null)
          return
        }

        const enemy = await Enemy.findByPk(selectedFight.enemy_id)

        if (!enemy) {
          await interaction.followUp(
            'Error: No enemy data found for this fight.'
          )
          resolve(null)
          return
        }

        resolve({ fightId: selectedFightId, enemy })
      })

      collector.on('end', (collected) => {
        if (!collected.size) {
          interaction.followUp('No fight was selected.')
          resolve(null)
        }
      })
    })
  } catch (error) {
    console.error('Error in selectFight:', error)
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply('Something went wrong while fetching fights.')
    } else {
      await interaction.followUp('Something went wrong while fetching fights.')
    }
    return null
  }
}

module.exports = { selectFight }
