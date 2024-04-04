const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { grantDailyReward } = require('./helpers/dailyRewardsHandler')
const { User } = require('../../Models/model')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily reward!'),
  async execute(interaction) {
    const userId = interaction.user.id
    const user = await User.findByPk(userId)

    if (!user) {
      await interaction.reply({
        content:
          "You don't have an account with us. Please register to claim daily rewards.",
        ephemeral: true,
      })
      return
    }
    try {
      // Grant the daily reward
      await grantDailyReward(user)

      async function replyWithRewardsStatus(interaction, user) {
        const rewards = [
          '5000 coins',
          'Exclusive Rare Card',
          '30 qubits',
          '10000 coins',
          'Exclusive Epic Card',
          '15000 coins',
          '60 qubits',
        ]

        let description = rewards
          .map((reward, index) => {
            // If the index (day number - 1) is less than the daily_streak, it means the reward has been claimed
            let claimedStatus =
              index + 1 <= user.daily_streak ? ' (claimed)' : ''
            return `Day ${index + 1}: ${reward}${claimedStatus}`
          })
          .join('\n')

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#00FF00')
              .setTitle('Daily Rewards Overview')
              .setDescription(description),
          ],
          ephemeral: true,
        })
      }

      // After granting the daily reward...
      await replyWithRewardsStatus(interaction, user)
    } catch (error) {
      console.error('Error granting daily reward:', error)
      // Reply to the user that an error occurred
      await interaction.reply({
        content:
          'An error occurred while trying to claim your daily reward. Please try again later.',
        ephemeral: true,
      })
    }
  },
}
