const { Op } = require('sequelize')
const { User, Character, UserGear, UserGearParts } = require('../Models/model')

async function deleteUserAccount(userId) {
  try {
    // Find and remove related records
    const relatedCharacters = await Character.findAll({
      where: { user_id: userId },
    })
    const relatedUserGear = await UserGear.findAll({
      where: { user_id: userId },
    })
    const relatedUserGearParts = await UserGearParts.findAll({
      where: { user_id: userId },
    })

    await Character.destroy({
      where: {
        user_id: null,
      },
    })

    await UserGear.destroy({
      where: {
        user_id: null,
      },
    })

    await UserGearParts.destroy({
      where: {
        user_id: null,
      },
    })

    for (const character of relatedCharacters) {
      await character.destroy()
      console.log('characters destroyed')
    }
    for (const gear of relatedUserGear) {
      await gear.destroy()
      console.log('gear destroyed')
    }
    for (const gearPart of relatedUserGearParts) {
      await gearPart.destroy()
      console.log('gear parts destroyed')
    }

    // Now delete the user
    const user = await User.findOne({ where: { user_id: userId } })
    if (user) {
      await user.destroy()
    }
  } catch (error) {
    console.error('Error deleting account:', error)
  }
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton()) return

    const customId = interaction.customId

    // Extract user ID from customId
    const userId = customId.split('_').pop()

    if (customId.startsWith('delete_account_yes')) {
      await deleteUserAccount(userId)
      await interaction.reply(
        `Successfully deleted account for user ID ${userId}`
      )
    } else if (customId.startsWith('delete_account_no')) {
      await interaction.reply(`Canceled account deletion for user ID ${userId}`)
    }
  },
}
