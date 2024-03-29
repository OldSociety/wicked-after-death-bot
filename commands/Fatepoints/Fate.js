const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { User } = require('../../Models/model.js') // Adjust according to your project structure

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
        .setName('roll')
        .setDescription('Automatically deduct 10 fate points if possible.')
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'give-fate') {
      const targetUser = interaction.options.getUser('user')
      const pointsToAdd = interaction.options.getInteger('points')

      const userData = await User.findOne({ where: { user_id: targetUser.id } })
      if (!userData) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000') // Red for error messages
          .setTitle('Error')
          .setDescription('User data not found.')

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true })
        return
      }

      userData.fate_points += pointsToAdd
      await userData.save()

      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00') // Green for success messages
        .setTitle('Fate Points Awarded')
        .setDescription(
          `${targetUser.username} has been given ${pointsToAdd} fate points. They now have ${userData.fate_points} points.`
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))

      await interaction.reply({ embeds: [successEmbed] })
    } else if (interaction.options.getSubcommand() === 'roll') {
      const userData = await User.findOne({
        where: { user_id: interaction.user.id },
      })

      if (!userData || userData.fate_points < 10) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000') // Red for error messages
          .setTitle('Error')
          .setDescription('Not enough fate points.')

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true })
        return
      }

      userData.fate_points -= 10
      await userData.save()

      const rollEmbed = new EmbedBuilder()
        .setColor('#FFFF00') // Yellow for neutral informative messages
        .setTitle('Fate Points Deducted')
        .setDescription(
          `10 fate points deducted for rolling fate. You now have ${userData.fate_points} points.`
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))

      await interaction.reply({ embeds: [rollEmbed] })
    }
  },
}
