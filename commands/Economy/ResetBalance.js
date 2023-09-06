const { SlashCommandBuilder } = require('discord.js');
const { DataTypes } = require('sequelize');
const sequelize = require('../../Utils/sequelize');
const User = require('../../Models/User')(sequelize, DataTypes);

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('reset_balance')
    .setDescription('Reset economy balance (DM ONLY) Exp: /reset_balance 100')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('The amount to reset the balance to')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user whose balance to reset (optional)')
    ),
  async execute(interaction) {
    // Check if the command is being used by the specific account with ID 138131238803210240
    if (interaction.user.id !== process.env.BOTADMINID) {
      await interaction.reply({
        content: 'You are not authorized to use this command.',
        ephemeral: true, // Make the response only visible to the user
      });
      return;
    }

    try {
      // Get the user's ID (you can adapt this based on how Discord.js provides user IDs)
      const userId = interaction.user.id;

      // Find the user by their user_id
      const user = await User.findOne({ where: { user_id: userId } });

      if (!user) {
        await interaction.reply({
          content: "You don't have an account. Use `/account` to create one.",
          ephemeral: true,
        });
        return;
      }

      // Get the amount from the command options
      const resetAmount = interaction.options.getInteger('amount');

      if (resetAmount <= 0) {
        return interaction.reply(`Please enter an amount greater than zero, ${interaction.user}.`);
      }

      // Check if a user parameter is provided, and if so, reset their balance instead
      const targetUser = interaction.options.getUser('user');

      if (targetUser) {
        const targetUserId = targetUser.id;

        // Find the target user by their ID
        const targetUserAccount = await User.findOne({ where: { user_id: targetUserId } });

        if (!targetUserAccount) {
          return interaction.reply({
            content: `The specified user doesn't have an account.`,
            ephemeral: true,
          });
        }

        // Update the target user's balance to the specified reset amount
        await targetUserAccount.update({ balance: resetAmount });

        await interaction.reply({
          content: `The balance for ${targetUser.tag}'s account has been reset to: ${resetAmount} coins`,
        });
      } else {
        // Update the user's own balance to the specified reset amount
        await user.update({ balance: resetAmount });

        await interaction.reply({
          content: `Your balance has been reset to: ${resetAmount} coins`,
        });
      }
    } catch (error) {
      console.error('Error fetching or updating user:', error);
      await interaction.reply({
        content: 'An error occurred. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
