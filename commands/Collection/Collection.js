const { SlashCommandBuilder } = require('discord.js')
// const { DataTypes } = require('sequelize');
// const sequelize = require('../../Utils/sequelize');
const { User, Character, MasterCharacter } = require('../../Models/models.js')
// const User = require('../../Models/User')(sequelize, DataTypes);
// const Character = require('../../Models/Character')(sequelize, DataTypes);
// const MasterCharacter = require('../../Models/MasterCharacter')(sequelize, DataTypes);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('collection')
    .setDescription('View the characters in your roster'),

  async execute(interaction) {
    const userId = interaction.user.id
    console.log('User Associations:', Object.keys(User.associations))
    console.log('Character Associations:', Object.keys(Character.associations))
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
        return interaction.reply('Your roster is empty.')
      }

      const characterList = characters.map((character) => {
        const masterInfo = character.masterCharacter
        return `Name: ${masterInfo.character_name}\nLevel: ${character.level}\nXP: ${character.experience}\nCost: ${masterInfo.cost}\nRarity: ${masterInfo.rarity}\nDescription: ${masterInfo.description}\nType: ${masterInfo.type}`
      })

      return interaction.reply(`Your roster:\n\n${characterList.join('\n\n')}`)
    } catch (error) {
      console.error(error)
      return interaction.reply(
        'Something went wrong while retrieving your roster.'
      )
    }
  },
}
