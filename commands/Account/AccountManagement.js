const { SlashCommandBuilder } = require('discord.js');
const { DataTypes } = require('sequelize');
const sequelize = require('../../Utils/sequelize');
const User = require('../../Models/User')(sequelize, DataTypes);

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('account_management')
    .setDescription('Manage user accounts (DM ONLY)')
    .addSubcommand(subcommand =>
      subcommand
        .setName('reset_balance')
        .setDescription('Reset a user\'s balance')
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('The amount to reset the balance to')
            .setRequired(true)
        )
        .addUserOption(option =>
          option.setName('user')
            .setDescription('The user whose balance to reset (optional)')
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete_account')
        .setDescription('Delete a user\'s account')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('The user whose account to delete')
            .setRequired(true)
        )),
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
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'reset_balance') {
        // Reset balance logic (same as before)
        // ...
      } else if (subcommand === 'delete_account') {
        const targetUser = interaction.options.getUser('user');
      
        if (!targetUser) {
          await interaction.reply('Invalid input. Please provide a user.');
          return;
        }
      
        // Check if the target user is the bot itself
        if (targetUser.id === interaction.client.user.id) {
          await interaction.reply('You cannot delete the bot\'s account.');
          return;
        }
      
        // Find the target user by their ID
        const targetUserAccount = await User.findOne({ where: { user_id: targetUser.id } });
      
        if (!targetUserAccount) {
          await interaction.reply({
            content: `The specified user doesn't have an account.`,
            ephemeral: true,
          });
          return;
        }
      
        // Ask for confirmation before deleting the account
        await interaction.reply({
          content: `Are you sure you want to delete the account for ${targetUser.tag}?`,
          components: [
            {
              type: 'ACTION_ROW',
              components: [
                {
                  type: 'BUTTON',
                  style: 'PRIMARY',
                  label: 'Yes',
                  customId: `delete_account_yes_${targetUser.id}`,
                },
                {
                  type: 'BUTTON',
                  style: 'DANGER',
                  label: 'No',
                  customId: `delete_account_no_${targetUser.id}`,
                },
              ],
            },
          ],
        });
      }
      
    } catch (error) {
      console.error('Error in account management command:', error);
      await interaction.reply({
        content: 'An error occurred. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
