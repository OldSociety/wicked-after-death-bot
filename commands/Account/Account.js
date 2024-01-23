const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { DataTypes, Sequelize } = require('sequelize')
const sequelize = require('../../config/sequelize.js')
const {
  scavengeHelper,
  getChanceToFind,
} = require('../../helpers/scavengeHelper')

const {
  User,
  Character,
  MasterCharacter,
  UserGear,
  GearParts,
  UserGearParts,
} = require('../../Models/model.js')

const startingCharacterIds = [0, 1, 2]
const startingGearParts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

function formatTimestampAndCalculateDays(timestamp) {
  const date = new Date(timestamp)
  const today = new Date()

  const formatDate = (date) => {
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yy = String(date.getFullYear()).substring(2, 4)
    return `${mm}/${dd}/${yy}`
  }

  const diffInDays = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000
    const diff = Math.abs(date1 - date2)
    return Math.round(diff / oneDay)
  }

  const formattedDate = formatDate(date)
  const daysDifference = diffInDays(date, today)

  return `${formattedDate} (${daysDifference} days)`
}

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('account')
    .setDescription('Create your Wicked after Death account'),
  async execute(interaction) {
    const userId = interaction.user.id
    const userName = interaction.user.username

    const t = await sequelize.transaction()
    let isRolledBack = false

    try {
      const [user, created] = await User.findOrCreate({
        where: { user_id: userId },
        defaults: { balance: 730, user_name: userName },

        transaction: t,
      })
      const chanceToFind = getChanceToFind(userId) // Assuming this returns a number like 0.03
      const findPercentage = (chanceToFind * 100).toFixed(0)
      const userCreatedAt = user.createdAt
      const result = formatTimestampAndCalculateDays(userCreatedAt)
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

          const gearPartsDetails = await GearParts.findAll({
            where: { parts_id: startingGearParts },
          })

          if (!gearPartsDetails || gearPartsDetails.length === 0) {
            throw new Error('Failed to fetch gear parts details')
          }

          // Create initial UserGear record
          await Promise.all(
            gearPartsDetails.map((part) => {
              return UserGearParts.create(
                {
                  user_id: userId,
                  parts_id: part.parts_id,
                  rarity: part.rarity,
                },
                { transaction: t }
              )
            })
          )
        await t.commit()

        const embed = new EmbedBuilder()
          .setTitle('Account Created')
          .setDescription('Your Hellbound: Wicked after Death is now active!')
          .addFields(
            {
              name: 'Current Balance',
              value:
                '🪙730 gold has been added to your balance to get you started.\nUse `/account` again at any time to see your balance and other account stats.',
            },
            {
              name: 'Characters',
              value:
                'Three new characters have been added to your collection.\nUse `/account` or `/collection CHARACTER_NAME` to learn more.',
            },
            {
              name: 'Scavenging',
              value:
                'Your characters have already begun scavenging the for new gear parts.\nUse `/scavenge` to learn more.',
            },
            {
              name: 'Help',
              value:
                'You can always use `/help` to see all the commands available to you.',
            }
          )

        await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        })
      } else {
        if (!isRolledBack) {
          try {
            await t.rollback()
            isRolledBack = true
          } catch (error) {
            console.error('Error while rolling back: ', error)
          }
        }

        const characters = await Character.findAll({
          where: { user_id: userId },
          include: [{ model: MasterCharacter, as: 'masterCharacter' }],
        })

        const charactersInfo = characters
          .map((character) => {
            const masterInfo = character.masterCharacter
            let rarityColor

            // Decide the font color based on the rarity
            switch (masterInfo.rarity) {
              case 'folk hero':
                rarityColor = '🟩'
                break
              case 'legend':
                rarityColor = '🟦'
                break
              case 'unique':
                rarityColor = '🟪'
                break
              default:
                rarityColor = '⬜'
            }
            const nameField = `${character.masterCharacter.character_name}`
            const levelField = `⏫${character.level}`
            const xpField = `${character.experience} / ${character.xp_needed}`

            // Adjust these numbers based on your own tests
            const nameSpaces = 20 - nameField.length
            const levelSpaces = 5

            return `\`${nameField}${' '.repeat(
              nameSpaces
            )}\`  \`${levelField}${' '.repeat(levelSpaces)}\`  \`${xpField}\``
          })
          .join('\n') 

        const embed = new EmbedBuilder()
          .setTitle(`${userName}`)
          .setDescription(`**Created on:** ${result}`)
          .addFields(
            {
              name: 'Balance:',
              value: '`' + `🪙${user.balance}` + '`',
            },
            {
              name: 'Scavenge:',
              value: '`' + `${findPercentage}% chance` + '`',
              inline: true,
            },
            {
              name: 'Characters Owned:',
              value: `${charactersInfo}`,
              inline: true,
            }
          )

        await interaction.reply({
          embeds: [embed],
        })
      }
    } catch (error) {
      if (!isRolledBack) {
        await t.rollback()
      }
      console.error('Error in execute:', error)
      return interaction.reply(
        'Something went wrong while creating your account.'
      )
    }
  },
}
