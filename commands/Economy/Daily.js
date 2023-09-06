const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { DataTypes } = require('sequelize');
const sequelize = require('../../Utils/sequelize');
const User = require('../../Models/User')(sequelize, DataTypes);

module.exports = {
  cooldown: 5, // Set a cooldown for this command (in seconds)
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Get your daily coins'),
  async execute(interaction) {
    try {
      // Find the user in the database using their Discord ID
      const user = await User.findOne({ where: { user_id: interaction.user.id } });
      console.log(user.user_id)

      if (!user) {
        // If the user doesn't exist in the database, inform them to create an account
        await interaction.reply({
          content: "You don't have an account. Use `/account` to create one.",
          ephemeral: true, // This makes the response only visible to the user who triggered the command
        });
        return;
      }

      let { balance } = user;

      function getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }

      // Expected output: 0, 1, or 2
      let daily_coins = 0;

      if (!balance) {
        console.log('Not found!');
      } else if (daily_coins === 0) {
        // Generate a random number of daily coins
        daily_coins = getRandomInt(5) + 3;
        console.log(`You come across ${daily_coins} on the floor!`);
        balance += daily_coins; // Update the user's balance

        // Update the user's balance in the database
        await user.update({ balance });
      }

      // Reply to the user with the result
      await interaction.reply({
        content: `You come across ${daily_coins} on the floor! Your balance: ${balance} coins`,
      });

      daily_coins = 0; // Reset daily_coins for the next day
    } catch (error) {
      console.error('Error fetching or updating user:', error);
      // Handle errors and inform the user
      await interaction.reply({
        content: 'An error occurred. Please try again later.',
        ephemeral: true, // This makes the error message only visible to the user who triggered the command
      });
    }
  },
};
