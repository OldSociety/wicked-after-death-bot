const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require('@discordjs/builders')
const { User, Character, MasterCharacter } = require('../../Models/model.js')

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

        const embedReset = new EmbedBuilder()
          .setTitle('Balance Reset Confirmation')
          .setDescription(
            `Successfully reset the balance of ${user.tag} to ${amount}.`
          )
        setColor(0x0099ff)

        await interaction.reply({
          embeds: [embedReset],
          ephemeral: true,
        })
      } else if (subcommand === 'delete_account') {
        console.log('Entered delete_account') // New log

        const targetUser = interaction.options.getUser('user')
        console.log(`Target User: ${targetUser}`) // New log

        if (!targetUser) {
          console.log('Invalid input, no user') // New log
          await interaction.reply('Invalid input. Please provide a user.')
          return
        }

        const targetUserAccount = await User.findOne({
          where: { user_id: targetUser.id },
        })
        console.log(`Target User Account: ${JSON.stringify(targetUserAccount)}`) // Existing log

        if (!targetUserAccount) {
          console.log('Target user not found') // New log
          await interaction.reply({
            content: "The specified user doesn't have an account.",
            ephemeral: true,
          })
          return
        }

        const yesButton = new ButtonBuilder()
          .setCustomId(`delete_account_yes_${targetUser.id}`)
          .setLabel('Yes')
          .setStyle(1)

        const noButton = new ButtonBuilder()
          .setCustomId(`delete_account_no_${targetUser.id}`)
          .setLabel('No')
          .setStyle(4)

        const row = new ActionRowBuilder().addComponents(yesButton, noButton)

        const embed = new EmbedBuilder()
          .setTitle('Account Deletion Confirmation')
          .setDescription(
            `Are you sure you want to delete the account for ${targetUser.tag}?`
          )
          .setColor(0x0099ff)
        await interaction.reply({ embeds: [embed], components: [row] })

        if (!interaction.isButton()) return

        const customId = interaction.customId

        // Extract user ID from customId
        const userId = customId.split('_').pop()

        if (customId.startsWith('delete_account_yes')) {
          try {
            const userAccount = await User.findOne({
              where: { user_id: userId },
            })

            if (!userAccount) {
              await interaction.reply(`No account found for user ID ${userId}`)
              return
            }

            await userAccount.destroy()
            await interaction.reply(
              `Successfully deleted account for user ID ${userId}`
            )
          } catch (error) {
            console.error('Error deleting account:', error)
            await interaction.reply(
              `An error occurred while deleting the account.`
            )
          }
        } else if (customId.startsWith('delete_account_no')) {
          await interaction.reply(
            `Canceled account deletion for user ID ${userId}`
          )
        }
      }
    } catch (error) {
      console.error('Error in account management command:', error) // Existing log
      await interaction.reply({
        content: 'An error occurred. Please try again later.',
        ephemeral: true,
      })
    }
  },
}
