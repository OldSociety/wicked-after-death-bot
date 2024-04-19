const { User, Character, UserGear, UserGearParts } = require('../Models/model')
const {
  battleManager,
} = require('../commands/Fight/helpers/battle/battleManager')
const {
  applyRound,
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
    const userId = customId.split('_').pop()
    const parts = customId.split('_')
    const actionType = parts[0] // 'battle' or 'delete_account'
    const battleAction = parts[1] // 'light_attack' or 'yes'/'no'
    const battleKey = parts[2] // Battle key or user ID

    if (customId.startsWith('battle_')) {
      const battle = battleManager[battleKey]
      if (!battle) {
        await interaction.reply('Battle not found or has already ended.')
        return
      }

      if (actionType === 'card') {
        const battle = battleManager[battleKey]
        if (!battle) {
          await interaction.reply({
            content: 'Battle not found or has already ended.',
            ephemeral: true,
          })
          return
        }

        const card = battle.deck[cardIndex] // Fetch the card based on the index
        if (!card) {
          await interaction.reply({
            content: 'Card not found or has already been played.',
            ephemeral: true,
          })
          return
        }

        // Apply the card effect here
        // Example: await applyCardEffect(card, battle, interaction);
        await interaction.update({
          content: `Played card: ${card.name}`,
          components: [], // Clear buttons after action or update as needed
          embeds: [],
        })

        console.log(`Played card: ${card.name}`)

        // Add logic for other battle actions if needed
      } else if (customId.startsWith('delete_account_yes')) {
        await deleteUserAccount(userId)
        await interaction.reply(
          `Successfully deleted account for user ID ${userId}`
        )
      } else if (customId.startsWith('delete_account_no')) {
        await interaction.reply(
          `Canceled account deletion for user ID ${userId}`
        )
      }
    }
  },
}
// Assume applyCardEffect is a function that modifies the game state
async function applyCardEffect(card, battle, interaction) {
  console.log(`Applying effect of card: ${card.name}`)
  // Implement your card logic here
}
