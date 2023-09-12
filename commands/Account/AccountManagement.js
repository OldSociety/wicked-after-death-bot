const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders')
const { User, Character, MasterCharacter } = require('../../Models/model.js')
const { MessageActionRow, MessageButton } = require('discord.js')

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('account_management')
    .setDescription('Manage user accounts (DM ONLY)')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete_account')
        .setDescription("Delete a user's account")
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('The user whose account to delete')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('reset_balance')
        .setDescription("Reset a user's balance")
        .addIntegerOption((option) =>
          option
            .setName('amount')
            .setDescription('The amount to reset the balance to')
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('The user whose balance to reset')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (interaction.user.id !== process.env.BOTADMINID) {
      await interaction.reply({
        content: 'You are not authorized to use this command.',
        ephemeral: true,
      })
      return
    }

    try {
      const subcommand = interaction.options.getSubcommand()

      if (subcommand === 'reset_balance') {
        // Get the user and amount from the interaction's options
        const user = interaction.options.getUser('user')
        const amount = interaction.options.getInteger('amount')

        // Find the user in your database
        const userAccount = await User.findOne({ where: { user_id: user.id } })

        if (!userAccount) {
          await interaction.reply({
            content: "The specified user doesn't have an account.",
            ephemeral: true,
          })
          return
        }

        // Reset the balance
        userAccount.balance = amount
        await userAccount.save()

        const color = parseInt('0099ff', 16)
        const embedReset = new EmbedBuilder()
          .setTitle('Balance Reset Confirmation')
          .setDescription(
            `Successfully reset the balance of ${user.tag} to ${amount}.`
          )
          .setColor(color)

        await interaction.reply({
          embeds: [embedReset],
          ephemeral: true,
        })
      } else if (subcommand === 'delete_account') {
        const targetUser = interaction.options.getUser('user')
        console.log('target user')

        if (!targetUser) {
          await interaction.reply('Invalid input. Please provide a user.')
          return
        }

        if (targetUser.id === interaction.client.user.id) {
          await interaction.reply("You cannot delete the bot's account.")
          return
        }

        const targetUserAccount = await User.findOne({
          where: { user_id: targetUser.id },
        })
        console.log(`Target User Account: ${JSON.stringify(targetUserAccount)}`)

        if (!targetUserAccount) {
          console.log('cant target')
          await interaction.reply({
            content: "The specified user doesn't have an account.",
            ephemeral: true,
          })
          return
        }

        const row = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId(`delete_account_yes_${targetUser.id}`)
            .setLabel('Yes')
            .setStyle('PRIMARY'),
          new MessageButton()
            .setCustomId(`delete_account_no_${targetUser.id}`)
            .setLabel('No')
            .setStyle('DANGER')
        )

        const embed = new EmbedBuilder()
          .setTitle('Account Deletion Confirmation')
          .setDescription(
            `Are you sure you want to delete the account for ${targetUser.tag}?`
          )
          .setColor('#0099ff')

        await interaction.reply({ embeds: [embed], components: [row] })
      }
    } catch (error) {
      console.error('Error in account management command:', error)
      await interaction.reply({
        content: 'An error occurred. Please try again later.',
        ephemeral: true,
      })
    }
  },
}
