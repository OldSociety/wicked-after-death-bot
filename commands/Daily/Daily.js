const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders')
const moment = require('moment-timezone')
const { User } = require('../../Models/model.js')

const usersClaimedToday = new Set()

function calculateTimeUntilNextReset() {
  const now = moment().tz('America/Los_Angeles')
  let nextReset

  if (now.hour() < 6) {
    // If before 6 AM today, next reset is today at 6 AM
    nextReset = now.clone().startOf('day').add(6, 'hours')
  } else {
    // If after 6 AM today, next reset is tomorrow at 6 AM
    nextReset = now.clone().add(1, 'day').startOf('day').add(6, 'hours')
  }

  const duration = moment.duration(nextReset.diff(now))
  return {
    hours: duration.hours(),
    minutes: duration.minutes(),
  }
}

function resetDailyClaims() {
  // This function resets the daily claims at the next 6 AM Pacific Time
  setTimeout(() => {
    usersClaimedToday.clear()
    resetDailyClaims() // Schedule the next reset
  }, calculateTimeUntilNextReset().hours * 3600000 + calculateTimeUntilNextReset().minutes * 60000)
}

// Initialize the first reset
resetDailyClaims()

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily reward!'),
  async execute(interaction) {
    const userId = interaction.user.id

    const user = await User.findOne({ where: { user_id: userId } })

    if (usersClaimedToday.has(userId)) {
      const { hours, minutes } = calculateTimeUntilNextReset()

      await interaction.reply({
        content: `You've already claimed your daily reward today. Please come back in ${hours} hours and ${minutes} minutes!`,
        ephemeral: true,
      })
    } else {
      usersClaimedToday.add(userId)

      const dailyRewards = [100, 200, 300, 400, 500, 600, 700]; // Define your daily rewards
        const rewardIndex = (user.daily_streak - 1) % dailyRewards.length;
        const dailyReward = dailyRewards[rewardIndex];

        // Increment the daily_streak and update in database
        let newStreak = user.daily_streak + 1;
        if (newStreak > 7 || newStreak < 1) newStreak = 1; // Reset streak after day 7

        // await updateUserData(userId, { daily_streak: newStreak }); // Adjust this to your actual data updating logic
        user.daily_streak = newStreak
        await user.save()

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Daily Reward')
        .setDescription(
          `You've successfully claimed your daily reward of ${dailyReward} coins!`
        )

      await interaction.reply({ embeds: [embed] })
    }
  },
}
