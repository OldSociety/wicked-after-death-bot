const { SlashCommandBuilder } = require('discord.js')
const { User } = require('../../Models/model.js') // Ensure this path matches your project structure

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fate')
    .setDescription('Interact with your fate points.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('give-fate')
        .setDescription('Manually add fate points.')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('The user to give fate points to')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('points')
            .setDescription('The number of fate points to give')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('roll-fate')
        .setDescription('Automatically deduct 10 fate points if possible.')
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'give-fate') {
        if (interaction.user.id !== process.env.BOTADMINID) {
            await interaction.reply({
              content: 'You are not authorized to use this command.',
              ephemeral: true,
            })
            return
          }
      const targetUser = interaction.options.getUser('user')
      const pointsToAdd = interaction.options.getInteger('points')

      const userData = await User.findOne({ where: { user_id: targetUser.id } })
      if (!userData) {
        await interaction.reply({
          content: 'User data not found.',
          ephemeral: true,
        })
        return
      }

      userData.fate_points += pointsToAdd
      await userData.save()

      await interaction.reply(
        `${targetUser.username} has been given 🎭${pointsToAdd} fate.`
      )
    } else if (interaction.options.getSubcommand() === 'roll-fate') {
      const userData = await User.findOne({
        where: { user_id: interaction.user.id },
      })

      if (!userData || userData.fate_points < 10) {
        await interaction.reply({
          content: 'Not enough fate points.',
          ephemeral: true,
        })
        return
      }

      userData.fate_points -= 10
      await userData.save()

      // Implement your logic for "rolling fate" here
      // For example, determining the outcome based on fate points or another mechanism

      await interaction.reply(
        `10 fate points deducted for rolling fate. You now have ${userData.fate_points} points.`
      )
    }
  },
}
