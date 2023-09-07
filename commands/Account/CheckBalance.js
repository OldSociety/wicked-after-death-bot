const { SlashCommandBuilder } = require('discord.js');
const { DataTypes } = require('sequelize');
const sequelize = require('../../Utils/sequelize');
const User = require('../../Models/User')(sequelize, DataTypes);

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check your account balance'),
  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      const user = await User.findOne({
        where: { user_id: userId },
      });

      if (user) {
        return interaction.reply(`You currently have ${user.balance} coins in your account.`);
      } else {
        return interaction.reply('You do not have an account yet.');
      }
    } catch (error) {
      console.error('Error in checking balance:', error);
      return interaction.reply('Something went wrong while checking your account balance.');
    }
  },
};
