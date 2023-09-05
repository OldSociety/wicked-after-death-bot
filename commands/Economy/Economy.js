const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js')
const { DataTypes } = require('sequelize')
const sequelize = require('../../Utils/sequelize')
const User = require('../../Models/User')(sequelize, DataTypes)

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('economy')
    .setDescription('Create your economy account!'),
  async execute(interaction) {
    // Get the user's ID (you can adapt this based on how Discord.js provides user IDs)

    const userId = interaction.user.id

    try {
      // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);

      const [user, created] = await User.findOrCreate({
        where: { user_id: userId },
        defaults: {
          balance: 730,
        },
      })

      console.log(user.user_id) // 'sdepold'
      console.log(user.balance) // This may or may not be 'Technical Lead JavaScript'
      console.log(created) // The boolean indicating whether this instance was just created

      if (created) {
        console.log(user) // This will certainly be 'Technical Lead JavaScript'
        return interaction.reply(
          `You economy account for has been created. You have 730 credits in your balance.`
        )
      } else {
        return interaction.reply(
          `You currently have ${user.balance} coins.`
        )
      }
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return interaction.reply('Account already exists.')
      }
      console.error(error)
      return interaction.reply('Something went wrong with adding an account.')
    }
  },
}
