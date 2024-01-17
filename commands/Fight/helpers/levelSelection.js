// levelSelection.js
const { StandardLevel } = require('../../../Models/model');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

async function selectLevel(interaction) {
  try {
    const levels = await StandardLevel.findAll();

    if (!levels.length) {
      await interaction.reply('There are currently no levels available.');
      return null;
    }

    const levelEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Choose Your Level')
      .setDescription('Select a level to start your adventure.');

    const levelSelectMenu = new StringSelectMenuBuilder()
      .setCustomId('levelSelect')
      .setPlaceholder('Select a level')
      .addOptions(
        levels.map(level => ({
          label: level.character_name,
          description: level.description,
          value: level.level_id.toString(),
        }))
      );

    const actionRow = new ActionRowBuilder().addComponents(levelSelectMenu);

    await interaction.reply({ embeds: [levelEmbed], components: [actionRow], ephemeral: true });

    const filter = (i) => i.customId === 'levelSelect' && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    return new Promise((resolve) => {
      collector.on('collect', async (i) => {
        const selectedLevelId = i.values[0];
        await i.update({ content: `You have selected level ${selectedLevelId}.`, components: [] });
        resolve(selectedLevelId);
      });

      collector.on('end', collected => {
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
