const { SlashCommandBuilder } = require('discord.js');
const { DataTypes } = require('sequelize');
const sequelize = require('../../Utils/sequelize');
const User = require('../../Models/User')(sequelize, DataTypes);

module.exports = {
  cooldown: 86400, // Set a cooldown for this command (in seconds), 86400 seconds = 24 hours
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Get your daily coins')
    .addBooleanOption(option =>
      option.setName('test')
        .setDescription('Add daily coins for testing (Admin only)')
    ),
  async execute(interaction) {
    try {
      const isTest = interaction.options.getBoolean('test');

      if (isTest && interaction.user.id !== process.env.BOTADMINID) {
        // If it's a test and the user is not the admin, deny access
        await interaction.reply({
          content: 'You are not authorized to use this command for testing.',
          ephemeral: true,
        });
        return;
      }

      // Check if the user has already claimed their daily coins today
      const hasClaimed = claimedDaily.has(interaction.user.id);

      if (hasClaimed && !isTest) {
        // If the user has already claimed and it's not a test, inform them
        await interaction.reply({
          content: 'You have already claimed your daily coins today.',
          ephemeral: true,
        });
        return;
      }

      // Get the current UTC hour
      const currentUTCHour = new Date().getUTCHours();

      // Calculate the time until the next reset (in seconds)
      let timeUntilReset = (resetHourUTC - currentUTCHour) * 3600; // Convert hours to seconds

      // Adjust for cases where the reset time has already passed today
      if (timeUntilReset <= 0) {
        timeUntilReset += 24 * 3600; // Add 24 hours in seconds for the next day's reset
      }

      // Find the user in the database using their Discord ID
      const user = await User.findOne({ where: { user_id: interaction.user.id } });

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
      } else if (daily_coins === 0 || isTest) {
        // Generate a random number of daily coins
        daily_coins = getRandomInt(5) + 3;
        console.log(`You come across ${daily_coins} on the floor!`);
        balance += daily_coins; // Update the user's balance

        // Update the user's balance in the database
        await user.update({ balance });

        // If it's a test, inform the user
        if (isTest) {
          await interaction.reply({
            content: `You come across ${daily_coins} on the floor! Your balance: ${balance} coins (Test Mode)`,
          });
        } else {
          // Mark the user as having claimed their daily coins for today
          claimedDaily.add(interaction.user.id);

          // Reply to the user with the result
          await interaction.reply({
            content: `You come across ${daily_coins} on the floor! Your balance: ${balance} coins`,
          });
        }
      }

      // Reset daily_coins for the next day
      daily_coins = 0;
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
