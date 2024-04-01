const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { User } = require('../../Models/model.js'); // Ensure the path matches your project structure

module.exports = {
  data: new SlashCommandBuilder()
    .setName('free')
    .setDescription('Claim your free reward (Available every 4 hours)'),
  async execute(interaction) {
    try {
      const user = await User.findOne({
        where: { user_id: interaction.user.id },
      });

      if (!user) {
        await interaction.reply({
          content: "You don't have an account. Use `/account` to create one.",
          ephemeral: true,
        });
        return;
      }

      const currentTime = new Date();
      const lastClaimTime = user.last_claim_time ? new Date(user.last_claim_time) : new Date(0); // Default to epoch if null
      const hoursSinceLastClaim = (currentTime - lastClaimTime) / (1000 * 60 * 60);

      const embed = new EmbedBuilder()
        .setTitle('Free Reward')
        .setColor(0x0099ff); // Direct color code usage

      if (hoursSinceLastClaim >= 4) {
        const rewardPoints = 100; // Example reward points, adjust as necessary
        user.balance += rewardPoints; // Update user balance
        user.last_claim_time = currentTime; // Update last claim time

        await user.save();

        embed.setDescription(`You've claimed your free ${rewardPoints} points!`)
             .addFields({ name: 'Balance', value: `Your new balance is 🪙${user.balance} points.` });

        await interaction.reply({ embeds: [embed] });
      } else {
        const timeRemaining = 4 - hoursSinceLastClaim;
        const hoursRemaining = Math.floor(timeRemaining);
        const minutesRemaining = Math.floor((timeRemaining - hoursRemaining) * 60);

        embed.setDescription(`You need to wait a bit longer for your next free reward.`)
             .addFields({ name: 'Time Remaining', value: `${hoursRemaining} hours and ${minutesRemaining} minutes.` });

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (error) {
      console.error('Error with the free command:', error);
      await interaction.reply({
        content: 'An error occurred while trying to claim your free reward. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
