const { StandardLevel } = require('../../../../Models/model');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

async function selectLevel(interaction) {
  try {
    const levels = await StandardLevel.findAll();

    if (levels.length === 0) {
      await interaction.editReply('There are currently no levels available.');
      return null;
    }

    const levelEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Choose Your Level')
      .setDescription('Select a level to start your adventure.');

    // Create multiple rows of buttons
    const actionRows = [];
    for (let i = 0; i < levels.length; i += 5) {
      const row = new ActionRowBuilder();
      levels.slice(i, i + 5).forEach(level => {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`levelSelect_${level.level_id}`)
            .setLabel(level.level_name)
            .setStyle('Primary')
        );
      });
      actionRows.push(row);
    }

    await interaction.editReply({
      embeds: [levelEmbed],
      components: actionRows,
      ephemeral: true,
    });

    const filter = (i) =>
      i.customId.startsWith('levelSelect_') && i.user.id === interaction.user.id;
    
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 15000,
    });

    return new Promise((resolve) => {
      collector.on('collect', async (i) => {
        const selectedLevelId = i.customId.split('_')[1];
        await i.update({
          content: `You have selected level ${selectedLevelId}.`,
          components: [],
        });
        collector.stop(); // Stop the collector
        resolve(selectedLevelId);
      });

      collector.on('end', (collected) => {
        if (!collected.size) {
          interaction.followUp('No level was selected.');
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error(error);
    await interaction.reply('Something went wrong while fetching levels.');
    return null;
  }
}

module.exports = { selectLevel };
