const {
  SlashCommandBuilder,
} = require('discord.js');
const { DataTypes } = require('sequelize');
const sequelize = require('../../Utils/sequelize');
const User = require('../../Models/User')(sequelize, DataTypes);

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('account')
    .setDescription('Create your economy account or check its balance!'),
  async execute(interaction) {
    // Get the user's ID (you can adapt this based on how Discord.js provides user IDs)
    const userId = interaction.user.id;

    try {
      // Create or find a user record with a default balance
      const [user, created] = await User.findOrCreate({
        where: { user_id: userId },
        defaults: {
          balance: 730, // Default balance if the user doesn't exist
        },
      });

      console.log(user.user_id); // User's unique ID
      console.log(user.balance); // User's balance
      console.log(created); // A boolean indicating whether this user was just created

      if (created) {
        console.log(user); // This user record was just created
        return interaction.reply(
          `Your economy account has been created. You have 730 credits in your balance.`
        );
      } else {
        return interaction.reply(
          `You currently have ${user.balance} coins in your account.`
        );
      }
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return interaction.reply('Account already exists.');
      }
      console.error(error);
      return interaction.reply('Something went wrong while creating your account.');
    }
  },
};
