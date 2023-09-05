const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js')
const { DataTypes } = require('sequelize'); 
const sequelize = require('../../Utils/sequelize');
const User = require('../../Models/User')(sequelize, DataTypes);

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your economy balance'),
  async execute(interaction) {



    try {
      const user = await User.findOne();
      const { dataValues: { balance} } = user

    //   // // Find the user by their user_id
    //   const total = await User.findOne({ where: { balance: User.balance } })
    //   console.log(User.balance === Number)

      if (balance === null) {
        console.log('Not found!')
      } else {
        console.log(balance)
      }

      await interaction.reply({
        content: `Your balance: ${balance} coins`,
      })
    } catch (error) {
      console.error('Error fetching user:', error)
      await interaction.reply({
        content:
          'An error occurred while fetching your balance. Please try again later.',
        ephemeral: true,
      })
    }

  }
}
