const { SlashCommandBuilder } = require('discord.js');
// const sequelize = require('../../app'); // Import the Sequelize instance from your app.js
const User = require('../../Models/User'); // Import the User model

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your economy balance'),
  async execute(interaction) {
    // Get the user's ID (you can adapt this based on how Discord.js provides user IDs)
    const userId = interaction.user.id;

    try {
      // // Find the user by their user_id
      const user = await User.findOne({ where: { user_id: userId } });

      if (!user) {
        return await interaction.reply({
          content: `You must have an economy account to use this command.`,
          ephemeral: true,
        });
      }

      const coins = user.coins;

      // Reply with the user's coin balance
      await interaction.reply({
        content: `Your balance: ${coins} coins`,
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      await interaction.reply({
        content: 'An error occurred while fetching your balance. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
