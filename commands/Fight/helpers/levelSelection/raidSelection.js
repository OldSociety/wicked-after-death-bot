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
    
    // Await the user's button interaction
    const res = await interaction.channel.awaitMessageComponent({ filter, time: 15000 });

    const selectedRaidId = res.customId.split('_')[1];
    await res.update({
      content: `You have selected Raid ${selectedRaidId}.`,
      components: [],
    });

    return selectedRaidId;

  } catch (error) {
    console.error('Error in selectRaid:', error);
    await interaction.followUp('Something went wrong while fetching raids.');
    return null;
  }
}

module.exports = { selectRaid };
