const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders')
const { User, Character, MasterCharacter } = require('../../Models/model.js')

function calculateTimeRemainingUntilTomorrow(targetHour) {
  const currentTime = new Date()
  const tomorrow = new Date(currentTime)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(targetHour, 0, 0, 0)
  const timeDifference = tomorrow - currentTime

  const hoursRemaining = Math.floor(timeDifference / (1000 * 60 * 60))
  const minutesRemaining = Math.floor(
    (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
  )

  return { hours: hoursRemaining, minutes: minutesRemaining }
}

const targetHourPST = 6

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Get your daily coins'),
  async execute(interaction) {
    try {
      const user = await User.findOne({
        where: { user_id: interaction.user.id },
      })

      if (!user) {
        await interaction.reply({
          content: "You don't have an account. Use `/create` to create one.",
          ephemeral: true,
        })
        return
      }

      const color = parseInt('0099ff', 16)
      const embed = new EmbedBuilder().setTitle('Daily Reward').setColor(color)

      const { balance, last_daily_claim, daily_streak } = user
      const lastClaimDate = last_daily_claim ? new Date(last_daily_claim) : null
      const currentTime = new Date()
      const timeElapsed = lastClaimDate
        ? currentTime - lastClaimDate
        : 24 * 60 * 60 * 1000
      const { hours, minutes } =
        calculateTimeRemainingUntilTomorrow(targetHourPST)

      let fields = []

      if (timeElapsed >= 86400000) {
        let updatedStreak = timeElapsed < 172800000 ? daily_streak + 1 : 0
        let randomBase = Math.floor(Math.random() * (500 - 300 + 1)) + 300
        let dailyCoins = randomBase + updatedStreak * 100

        if (updatedStreak < 7) {
          dailyCoins = Math.min(dailyCoins, 3500)
        } else {
          dailyCoins = Math.min(dailyCoins, 12000)
        }

        const newBalance = balance + dailyCoins

        await user.update({
          balance: newBalance,
          last_daily_claim: currentTime,
          daily_streak: updatedStreak,
        })

        fields.push({
          name: 'Reward',
          value: `You find ` + '`' + `🪙${dailyCoins}` + '`' + ` gold on the floor! Your balance:` + '`' + `🪙${newBalance}` + '`' + ` gold.`,
        })
        fields.push({
          name: 'Next Claim',
          value: `You can claim more daily rewards in` + '`' + ` ${hours} hours ${minutes} minutes` + '.`',
        })

        embed.addFields(fields)

        await interaction.reply({ embeds: [embed] })
      } else {
        fields.push({
          name: 'Next Claim',
          value: `You have ` + '`' + `${hours} hours ${minutes} minutes` + '`' + ` remaining until your next claim.`,
        })

        embed.addFields(fields)

        await interaction.reply({ embeds: [embed], ephemeral: true })
      }
    } catch (error) {
      console.error('Error fetching or updating user:', error)
      await interaction.reply({
        content: 'An error occurred. Please try again later.',
        ephemeral: true,
      })
    }
  },
}
