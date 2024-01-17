// raidSelection.js
const { StandardRaid } = require('../../../Models/model');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

async function selectRaid(interaction, levelId) {
  try {
    const raids = await StandardRaid.findAll({
      where: { level_id: levelId }
    });

    if (!raids.length) {
      await interaction.followUp('No raids available for this level.');
      return null;
    }

    const raidEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Choose Your Raid')
      .setDescription('Select a raid to continue your adventure.');

    const raidSelectMenu = new StringSelectMenuBuilder()
      .setCustomId('raidSelect')
      .setPlaceholder('Select a raid')
      .addOptions(
        raids.map(raid => ({
          label: `Raid ${raid.raid_id}`,
          value: raid.raid_id.toString(),
        }))
      );

    const actionRow = new ActionRowBuilder().addComponents(raidSelectMenu);

    await interaction.followUp({ embeds: [raidEmbed], components: [actionRow], ephemeral: true });

    const filter = (i) => i.customId === 'raidSelect' && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    return new Promise((resolve) => {
      collector.on('collect', async (i) => {
        const selectedRaidId = i.values[0];
        await i.update({ content: `You have selected Raid ${selectedRaidId}.`, components: [] });
        resolve(selectedRaidId);
      });

      collector.on('end', collected => {
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
