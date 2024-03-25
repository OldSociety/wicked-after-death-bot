const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { DataTypes, Sequelize } = require('sequelize')
const sequelize = require('../../config/sequelize.js')

const { User, Character, MasterCharacter } = require('../../Models/model.js')

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('album_builder')
    .setDescription('Build your character album'),
  async execute(interaction) {
    const userId = interaction.user.id

    try {
      const user = await User.findOne({
        where: { user_id: userId },
        include: [
          {
            model: Character,
            as: 'characters',
            include: [
              {
                model: MasterCharacter,
                as: 'masterCharacter',
                attributes: { exclude: ['master_character_id'] },
              },
            ],
          },
        ],
      })

      if (!user) {
        return interaction.reply('You do not have an account.')
      }

      const characters = user.characters || []

      if (characters.length === 0) {
        return interaction.reply('Your album is empty.')
      }
      // Generate the list of characters for the embed
      const characterList = user.characters
        .map(
          (character, index) =>
            `${index + 1} **${character.masterCharacter.character_name}**　•　Lvl. ${
              character.level
            }　•　🧡${character.effective_health}　•　⚔️${
                character.effective_damage
            }`
        )
        .join('\n')

      const albumEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Your album`)
        .setDescription(characterList)

      await interaction.reply({
        embeds: [albumEmbed],
        ephemeral: true,
      })
    } catch (error) {
      console.error(error)
      return interaction.reply(
        'Something went wrong while retrieving your roster.'
      )
    }
  },
}
