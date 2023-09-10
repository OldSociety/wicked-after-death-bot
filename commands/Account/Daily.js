const { SlashCommandBuilder } = require('@discordjs/builders')
const { User, Character, MasterCharacter } = require('../../Models/model.js')

// Function to calculate and return the time remaining until the same time tomorrow
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

const targetHourPST = 6 // Define targetHourPST here

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
          content: "You don't have an account. Use `/account` to create one.",
          ephemeral: true,
        })
        return
      }

      const { balance, last_daily_claim } = user
      const lastClaimDate = last_daily_claim ? new Date(last_daily_claim) : null
      const currentTime = new Date()
      const timeElapsed = lastClaimDate
        ? currentTime - lastClaimDate
        : 24 * 60 * 60 * 1000 // set to 24 hours if last_daily_claim is null
      const { hours, minutes } =
        calculateTimeRemainingUntilTomorrow(targetHourPST)

      if (timeElapsed >= 86400000) {
        let updatedStreak = timeElapsed < 172800000 ? daily_streak + 1 : 0

        let randomBase = Math.floor(Math.random() * (500 - 300 + 1)) + 300
        let dailyCoins = randomBase + updatedStreak * 100 // Incremented the streak bonus

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

        await interaction.reply({
          content: `You come across ${dailyCoins} on the floor! Your balance: ${newBalance} coins. You can claim more daily rewards in ${hours} hours and ${minutes} minutes.`,
        })
      } else {
        console.log(
          `Last claim was on: ${
            last_daily_claim ? last_daily_claim : 'Never claimed'
          }`
        )
        await interaction.reply({
          content: `You have already claimed your daily coins today. You have ${hours} h ${minutes} m remaining until your next claim.`,
          ephemeral: true,
        })
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
