const executeSpecial = async (character, threshold) => {
    characterInstance.specialsQueue = [];
    // Send ephemeral embed with dropdown here
    const StringSelectMenuBuilder = require('discord.js/src/structures/StringSelectMenuBuilder')
const ActionRowBuilder  = require('discord.js').ActionRowBuilder // Adjust import as needed

const createCharacterSelectMenu = (userCharacters) => {
  const selectOptions = userCharacters.map((character) => {
    const masterInfo = character.masterCharacter
    let rarityColor

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
    // Assume handleDropdown is a function that waits for dropdown selection.
    const selected = await handleDropdown();
  
    let activate = false;
    if (selected) {
      activate = true;
    } else if (Math.random() < 0.4) {
      activate = true;
    }
  
    if (activate) {
      // Your logic to activate the special ability based on the threshold
    }
  };
  
  const checkSpecialTrigger = async (character) => {
    const healthPercent = (character.current_health / character.max_health) * 100;
  
    if (healthPercent <= 90 && !character.special90) {
      character.special90 = true;
      character.specialsQueue.push('90');
    }
    if (healthPercent <= 60 && !character.special60) {
      character.special60 = true;
      character.specialsQueue.push('60');
    }
    if (healthPercent <= 30 && !character.special30) {
      character.special30 = true;
      character.specialsQueue.push('30');
    }
  
    if (character.specialsQueue.length > 0) {
      const nextSpecial = character.specialsQueue.shift(); // Remove and get the first element
      await executeSpecial(character, nextSpecial); // Execute the special and remove it from the queue
    }
  };
  
  
  module.exports = { checkSpecialTrigger };
  