const { StandardRaid } = require('../../../../Models/model');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

async function selectRaid(interaction, levelId) {
  try {
    const raids = await StandardRaid.findAll({
      where: { level_id: levelId },
    }); 

    if (raids.length === 0) {
      await interaction.editReply('No raids available for this level.');
      return null;
    }

    const raidEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Choose Your Raid')
      .setDescription('Select a raid to continue your adventure.');

    // Create multiple rows of buttons
    const actionRows = [];
    for (let i = 0; i < raids.length; i += 5) {
      const row = new ActionRowBuilder();
      raids.slice(i, i + 5).forEach(raid => {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`raidSelect_${raid.raid_id}`)
            .setLabel(`Raid ${raid.raid_id}`)
            .setStyle('Success')
        );
      });
      actionRows.push(row);
    }

    await interaction.editReply({
      embeds: [raidEmbed],
      components: actionRows,
      ephemeral: true,
    });

    const filter = (i) =>
      i.customId.startsWith('raidSelect_') && i.user.id === interaction.user.id;
    
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 15000,
    });

    return new Promise((resolve) => {
      collector.on('collect', async (i) => {
        const selectedRaidId = i.customId.split('_')[1];
        await i.update({
          content: `You have selected Raid ${selectedRaidId}.`,
          components: [],
        });
        collector.stop(); // Stop the collector
        resolve(selectedRaidId);
      });

      collector.on('end', (collected) => {
        if (!collected.size) {
          interaction.followUp('No raid was selected.');
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error(error);
    await interaction.followUp('Something went wrong while fetching raids.');
    return null;
  }
}

module.exports = { selectRaid };
