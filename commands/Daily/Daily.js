const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { User } = require('../../Models/model.js');
const moment = require('moment-timezone');

function calculateTimeUntilReset(targetHour) {
    const now = moment.tz('America/Los_Angeles'); // Current time in Pacific Time
    let resetTime = now.clone().startOf('day').add(targetHour, 'hours');

    if (now > resetTime) {
        // If current time is past today's reset time, move resetTime to tomorrow
        resetTime.add(1, 'day');
    }

    const timeDifference = resetTime.diff(now); // Difference in milliseconds
    const duration = moment.duration(timeDifference);

    return {
        hours: duration.hours(),
        minutes: duration.minutes(),
    };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Get your daily reward!'),
  async execute(interaction) {
    const user = await User.findOne({ where: { user_id: interaction.user.id } });

    if (!user) {
      await interaction.reply({
        content: "You don't have an account. Use `/account` to create one.",
        ephemeral: true,
      });
      return;
    }

    const lastClaimTime = user.last_daily_claim ? moment(user.last_daily_claim) : moment().subtract(2, 'days');
    const resetTime = lastClaimTime.clone().startOf('day').add(6, 'hours'); // 6 AM reset time

    if (moment().tz('America/Los_Angeles') < resetTime) {
      // Has already claimed today
      const { hours, minutes } = calculateTimeUntilReset(6);

      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Daily Reward')
        .setDescription(`You've already claimed your daily reward today.\nCome back in ${hours} hours and ${minutes} minutes for your next reward!`);

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      // Can claim
      // Implement your logic here for awarding the daily reward
      const dailyReward = 100; // Example reward amount
      user.balance += dailyReward; // Update balance
      user.last_daily_claim = moment().tz('America/Los_Angeles').toDate(); // Update last claim time
      await user.save();

      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Daily Reward')
        .setDescription(`You've successfully claimed your daily reward of ${dailyReward} coins!`);

      await interaction.reply({ embeds: [embed] });
    }
  },
};
