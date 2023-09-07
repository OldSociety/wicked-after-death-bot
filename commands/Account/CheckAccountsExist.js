const { SlashCommandBuilder } = require('discord.js');
const { DataTypes } = require('sequelize');
const sequelize = require('../../Utils/sequelize');
const User = require('../../Models/User')(sequelize, DataTypes);

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('check')
    .setDescription('Check if a user has an account')
    .addUserOption((option) => option.setName('user').setDescription('Select a user to check')),
  async execute(interaction) {
    const userToCheck = interaction.options.getUser('user');
    const userId = userToCheck.id;

    try {
      const user = await User.findOne({
        where: { user_id: userId },
      });

      if (user) {
        return interaction.reply(`The user with ID ${userId} has an account.`);
      } else {
        return interaction.reply(`The user with ID ${userId} does not have an account.`);
      }
    } catch (error) {
      console.error('Error in checking account existence:', error);
      return interaction.reply('Something went wrong while checking if the account exists.');
    }
  },
};
