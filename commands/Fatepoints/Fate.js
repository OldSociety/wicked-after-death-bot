const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fate')
    .setDescription('Displays your current fate points.'),
  async execute(interaction) {
    const userData = await User.findOne({ where: { id: interaction.user.id } });
    if (userData) {
      await interaction.reply(`You currently have ${userData.fate_points} points.`);
    } else {
      await interaction.reply('Could not find your user data.');
    }
  },
};