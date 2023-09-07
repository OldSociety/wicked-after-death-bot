const { SlashCommandBuilder } = require('@discordjs/builders');
const { DataTypes } = require('sequelize');
const sequelize = require('../../Utils/sequelize');
const User = require('../../Models/User')(sequelize, DataTypes);

// Function to calculate and return the time remaining until the same time tomorrow
function calculateTimeRemainingUntilTomorrow(targetHour) {
  const currentTime = new Date();
  
  // Create a new date object for tomorrow
  const tomorrow = new Date(currentTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Set the target time on tomorrow's date
  tomorrow.setHours(targetHour, 0, 0, 0);
  
  // Calculate the time difference
  const timeDifference = tomorrow - currentTime;

  // Convert the time difference to hours and minutes
  const hoursRemaining = Math.floor(timeDifference / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

  return { hours: hoursRemaining, minutes: minutesRemaining };
}

// Example usage:
const targetHourPST = 6; // 6:00 AM PST
// const remainingTime = calculateTimeRemainingUntilTomorrow(targetHourPST);

// console.log(`Hours remaining: ${remainingTime.hours}`);
// console.log(`Minutes remaining: ${remainingTime.minutes}`);

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
      const currentTime = new Date();
      const timeElapsed = currentTime - last_daily_claim;

      // Calculate the time remaining until the next daily reset (6am Pacific Time)
      const { hours, minutes } = calculateTimeRemainingUntilTomorrow(targetHourPST);

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
          content: `You come across ${dailyCoins} on the floor! Your balance: ${newBalance} coins. You can claim more daily rewards in ${hours} hours and ${minutes} minutes.`,
        });
      } else {
        // If the user can't claim yet, inform them about the remaining time
        await interaction.reply({
          content: `You have already claimed your daily coins today. You have ${hours} h ${minutes} m remaining until your next claim.`,
          ephemeral: true,
        });
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
