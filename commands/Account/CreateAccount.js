const { SlashCommandBuilder } = require('discord.js')
const { DataTypes, Sequelize } = require('sequelize')
const sequelize = require('../../Utils/sequelize')
const User = require('../../Models/User')(sequelize, DataTypes)
const Collection = require('../../Models/Collection')(sequelize, DataTypes)
const CharacterList = require('../../db/dbCharacters')

const specificCharacterIds = [0, 1, 2]

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('create')
    .setDescription('Create your economy account'),
  async execute(interaction) {
    const userId = interaction.user.id
    const t = await sequelize.transaction() // Initialize transaction

    try {
      const [user, created] = await User.findOrCreate({
        where: { user_id: userId },
        defaults: {
          balance: 730,
        },
        include: [{ model: Collection, as: 'collections' }], // Explicit include
        transaction: t, // Add transaction
      })

      // Function to calculate XP needed for next level
      const calculateXpNeeded = (level) => {
        if (level >= 1 && level <= 6) return 1000 * (level + 1)
        if (level >= 7 && level <= 8) return 6000 + (level + 1 - 6) * 2000
        if (level >= 9 && level <= 10) return 21000 + (level + 1 - 8) * 2000
        // more levels here
        return 1000 + (level - 1) * 1000
      }

      if (created) {
        await Promise.all(
          specificCharacterIds.map((id) => {
            const character = CharacterList.find((c) => c.character_id === id)
            return Collection.create(
              {
                user_id: userId,
                character_id: id,
                character_name: character.character_name,
                level: 1,
                experience: 0,
                xp_needed: calculateXpNeeded(0),
              },
              { transaction: t }
            )
          })
        )

        await t.commit() // Commit transaction

        return interaction.reply(
          `Your economy account has been created. You have 730 credits in your balance.`
        )
      } else {
        await t.rollback() // Rollback transaction
        return interaction.reply(
          `You already have an account. You currently have ${user.balance} coins in your account.`
        )
      }
    } catch (error) {
      await t.rollback() // Rollback transaction in case of error
      console.error('Error in execute:', error)
      return interaction.reply(
        'Something went wrong while creating your account.'
      )
    }
  },
}
