const StringSelectMenuBuilder = require('discord.js/src/structures/StringSelectMenuBuilder')
const ActionRowBuilder = require('discord.js').ActionRowBuilder // Adjust import as needed

const createCharacterSelectMenu = (userCharacters) => {
  const selectOptions = userCharacters.map((character) => {
    const masterInfo = character.masterCharacter
    let rarityColor

    // Decide the font color based on the rarity
    switch (masterInfo.rarity) {
      case 'rare':
        rarityColor = '🟢' // Bronze
        break
      case 'epic':
        rarityColor = '🔵' // Purple
        break
      case 'legendary':
        rarityColor = '🟣' // Yellow
        break
      case 'minion':
        rarityColor = '⚫' // Black
      default:
        rarityColor = '⚪' // White
    }

    const characterInfo = `${rarityColor} Lvl ${character.level} | ⚔️: ${masterInfo.base_damage} | 🧡 ${masterInfo.base_health}`

    return {
      label: character.masterCharacter.character_name,
      value: character.masterCharacter.master_character_id.toString(),
      description: ` ${characterInfo}`,
    }
  })

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('characterSelect')
    .setPlaceholder('Select a Character')
    .addOptions(selectOptions)

  const actionRow = new ActionRowBuilder().addComponents(selectMenu)

  return actionRow
}

module.exports = {
  createCharacterSelectMenu,
}
