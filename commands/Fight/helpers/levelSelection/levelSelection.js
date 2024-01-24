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

    const actionRows = levels.map(level => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`levelSelect_${level.level_id}`)
          .setLabel(level.level_name)
          .setStyle('Primary')
      );
    });

    await interaction.editReply({
      embeds: [levelEmbed],
      components: actionRows,
      ephemeral: true,
    });

    const filter = (i) => i.customId.startsWith('levelSelect_') && i.user.id === interaction.user.id;
    const res = await interaction.channel.awaitMessageComponent({ filter, time: 15000 });

    const selectedLevelId = res.customId.split('_')[1];
    await res.update({ content: `You have selected level ${selectedLevelId}.`, components: [] });

    return selectedLevelId;
  } catch (error) {
    console.error('Error in selectLevel:', error);
    await interaction.followUp({ content: 'Something went wrong while fetching levels.', ephemeral: true });
    return null;
  }
}

module.exports = { selectLevel };
