const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders')
const { User } = require('../../Models/model.js') // Adjust the import path as per your structure

module.exports = {
  data: new SlashCommandBuilder()
    .setName('free')
    .setDescription('Claim your free reward (Available every 8 hours)'),
  async execute(interaction) {
    const userId = interaction.user.id

    try {
      const user = await User.findOne({ where: { user_id: userId } })
      if (!user) {
        await interaction.reply({
          content: "You don't have an account. Use `/account` to create one.",
          ephemeral: true,
        })
        return
      }

      // Debugging: Check the current last_daily_claim value
      console.log(`Last claim time from database: ${user.last_daily_claim}`)

      const currentTime = new Date()
      const lastClaimTime = user.last_daily_claim
        ? new Date(user.last_daily_claim)
        : new Date(0)
      const timeSinceLastClaimMs = currentTime - lastClaimTime
      const hoursSinceLastClaim = timeSinceLastClaimMs / (1000 * 60 * 60)

      // Debugging: Log the calculated hours since last claim
      console.log(`Hours since last claim: ${hoursSinceLastClaim}`)

      if (hoursSinceLastClaim >= 8) {
        // Update user balance and last claim time
        const rewardPoints = 100 // Set your reward points
        user.balance += rewardPoints // Update the user's balance
        user.last_daily_claim = currentTime // Set the current time as the last claim time

        // Save changes to the database
        await user.save()

        // Confirm to the user
        const embed = new EmbedBuilder()
          .setTitle('Free Reward')
          .setColor(0x0099ff)
          .setDescription(`You've claimed your free ${rewardPoints} points!`)
          .addFields({
            name: 'New Balance',
            value: `🪙 ${user.balance} points`,
          })

        await interaction.reply({ embeds: [embed] })
      } else {
        // Calculate the remaining time until the next claim is available
        const timeRemaining = 8 - hoursSinceLastClaim
        const hoursRemaining = Math.floor(timeRemaining)
        const minutesRemaining = Math.floor(
          (timeRemaining - hoursRemaining) * 60
        )

        await interaction.reply({
          content: `You need to wait ${hoursRemaining} hours and ${minutesRemaining} minutes before claiming your next free reward.`,
          ephemeral: true,
        })
      }
    } catch (error) {
      console.error('Error in the /free command:', error)
      await interaction.reply({
        content:
          'An error occurred while trying to claim your free reward. Please try again later.',
        ephemeral: true,
      })
    }
  },
}
