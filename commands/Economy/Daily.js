const { SlashCommandBuilder } = require('@discordjs/builders');
const { DataTypes } = require('sequelize');
const sequelize = require('../../Utils/sequelize');
const User = require('../../Models/User')(sequelize, DataTypes);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Get your daily coins'),
  async execute(interaction) {
    try {
      // Find the user in the database using their Discord ID
      const user = await User.findOne({ where: { user_id: interaction.user.id } });

      if (!user) {
        // If the user doesn't exist in the database, inform them to create an account
        await interaction.reply({
          content: "You don't have an account. Use `/account` to create one.",
          ephemeral: true,
        });
        return;
      }

      const { balance, last_daily_claim } = user;
      const currentTime = new Date().getTime();
      const resetHourUTC = 14; // 6am Pacific Time is 14:00 UTC

      // Calculate the time elapsed since the last claim in milliseconds
      const timeElapsed = currentTime - last_daily_claim;

      if (timeElapsed >= 24 * 60 * 60 * 1000) {
        // If it has been at least 24 hours since the last claim
        const dailyCoins = Math.floor(Math.random() * (8 - 3 + 1)) + 3; // Random between 3 and 8 coins
        const newBalance = balance + dailyCoins;

        // Update the user's balance and last claim timestamp in the database
        await user.update({
          balance: newBalance,
          last_daily_claim: currentTime,
        });

        // Reply to the user with the result
        await interaction.reply({
          content: `You come across ${dailyCoins} on the floor! Your balance: ${newBalance} coins`,
        });
      } else {
        // Calculate the time remaining until the next daily reset (6am Pacific Time)
        const nextResetTimeUTC = resetHourUTC - (currentTime % (24 * 60 * 60 * 1000));
        const hoursRemaining = Math.floor(nextResetTimeUTC / (60 * 60 * 1000));
        const minutesRemaining = Math.floor((nextResetTimeUTC % (60 * 60 * 1000)) / (60 * 1000));

        // Inform the user about the remaining time
        await interaction.reply({
          content: `You have already claimed your daily coins today. Claim more daily rewards in ${Math.abs(hoursRemaining)} h ${Math.abs(minutesRemaining)} m.`,
          ephemeral: true,
        });

        // Console log the remaining time
        console.log(`Time remaining until next daily reset: ${Math.abs(hoursRemaining)} h ${Math.abs(minutesRemaining)} m`);
      }
    } catch (error) {
      console.error('Error fetching or updating user:', error);
      // Handle errors and inform the user
      await interaction.reply({
        content: 'An error occurred. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
