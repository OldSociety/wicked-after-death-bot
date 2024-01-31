const { Op } = require('sequelize')
const { User, Character, UserGear, UserGearParts } = require('../Models/model')
const {
  battleManager,
} = require('../commands/Fight/helpers/battle/battleManager')
const {
  applyDamage,
} = require('../commands/Fight/helpers/battle/battleLogic/characterActions')
const {
  handleBattleEnd,
} = require('../commands/Fight/helpers/battle/battleLogic/battleEndHandlers')

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
    const parts = customId.split('_')
    const actionType = parts[0] // 'battle' or 'delete_account'
    const battleAction = parts[1] // 'light_attack' or 'yes'/'no'
    const battleKey = parts[2] // Battle key or user ID

    if (actionType === 'battle') {
      // console.log('interaction battlekey: ', battleKey)
      const battle = battleManager[battleKey]
      if (!battle) {
        await interaction.reply('Battle not found or has already ended.')
        return
      }

      if (battleAction === 'light_attack') {
        await applyDamage(battle.characterInstance, battle.enemyInstance)
        await interaction.reply(
          `${battle.characterInstance.character_name} attacks with a light strike!`
        )

        // Check if enemy is defeated
        if (battle.enemyInstance.current_health <= 0) {
          handleBattleEnd(battleKey, interaction)
        }
      }
      // Add logic for other battle actions if needed
    } else if (actionType === 'delete_account') {
      const userId = battleKey // In this case, battleKey is the userId
      if (battleAction === 'yes') {
        await deleteUserAccount(userId)
        await interaction.reply(
          `Successfully deleted account for user ID ${userId}`
        )
      } else if (battleAction === 'no') {
        await interaction.reply(
          `Canceled account deletion for user ID ${userId}`
        )
      }
    }
  },
}
