const { StandardFight, Enemy } = require('../../../../Models/model');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

async function selectFight(interaction, raidId) {
  try {
    const fights = await StandardFight.findAll({ where: { raid_id: raidId } });

    if (fights.length === 0) {
      await interaction.editReply('There are currently no fights available.');
      return null;
    }

    const fightEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Choose Your Fight')
      .setDescription('Select a fight to start your adventure.');

    // Create multiple rows of buttons
    const actionRows = [];
    for (let i = 0; i < fights.length; i += 5) {
      const row = new ActionRowBuilder();
      fights.slice(i, i + 5).forEach(fight => {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`fightSelect_${fight.fight_id}`)
            .setLabel(`${fight.fight_name}`)
            .setStyle('Danger')
        );
      });
      actionRows.push(row);
    }

    await interaction.editReply({
      embeds: [fightEmbed],
      components: actionRows,
      ephemeral: true,
    });

    const filter = (i) =>
      i.customId.startsWith('fightSelect_') && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 15000,
    });

    return new Promise((resolve) => {
      collector.on('collect', async (i) => {
        const selectedFightId = i.customId.split('_')[1];
        const selectedFight = fights.find(fight => fight.fight_id.toString() === selectedFightId);

        if (!selectedFight) {
          await interaction.followUp('Error: Fight not found.');
          resolve(null);
          return;
        }

        const enemy = await Enemy.findByPk(selectedFight.enemy_id);

        if (!enemy) {
          await interaction.followUp('Error: No enemy data found for this fight.');
          resolve(null);
          return;
        }

        resolve({ fightId: selectedFightId, enemy });
      });

      collector.on('end', (collected) => {
        if (!collected.size) {
          interaction.followUp('No fight was selected.');
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error in selectFight:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply('Something went wrong while fetching fights.');
    } else {
      await interaction.followUp('Something went wrong while fetching fights.');
    }
    return null;
  }
}

module.exports = { selectFight };
