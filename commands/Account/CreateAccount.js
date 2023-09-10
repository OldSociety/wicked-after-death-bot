const { SlashCommandBuilder } = require('discord.js')
const { DataTypes, Sequelize } = require('sequelize')
const sequelize = require('../../Utils/sequelize')
const { User, Character, MasterCharacter } = require('../../Models/model.js');

const startingCharacterIds = [0, 1, 2]

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('create')
    .setDescription('Create your economy account'),
  async execute(interaction) {
    const userId = interaction.user.id
    const t = await sequelize.transaction()

    try {
      const [user, created] = await User.findOrCreate({
        where: { user_id: userId },
        defaults: { balance: 730 },
        transaction: t,
      })

      if (created) {
        await Promise.all(
          startingCharacterIds.map((id) => {
            return Character.create(
              {
                user_id: userId,
                master_character_id: id,
              },
              { transaction: t }
            )
          })
        )

        await t.commit()

        return interaction.reply(
          `Your economy account has been created with a balance of 730 gold. You've unlocked three new characters! Use /collection to view your character roster.`
        )
      } else {
        await t.rollback()
        return interaction.reply(
          `You already have an account. You currently have ${user.balance} coins in your account.`
        )
      }
    } catch (error) {
      await t.rollback()
      console.error('Error in execute:', error)
      return interaction.reply(
        'Something went wrong while creating your account.'
      )
    }
  },
}
