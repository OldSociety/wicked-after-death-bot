const StringSelectMenuBuilder = require('discord.js/src/structures/StringSelectMenuBuilder');
const ActionRowBuilder = require('discord.js').ActionRowBuilder; // Adjust import as needed

const createCharacterSelectMenu = (userCharacters) => {
  const selectOptions = userCharacters.map((character) => {
    return {
      label: character.masterCharacter.character_name,
      value: character.masterCharacter.master_character_id.toString(),
      description: `Select ${character.masterCharacter.character_name} for the fight`,
    };
  });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('characterSelect')
    .setPlaceholder('Select a Character')
    .addOptions(selectOptions);

  const actionRow = new ActionRowBuilder()
    .addComponents(selectMenu);

  return actionRow;
};

module.exports = {
  createCharacterSelectMenu,
};
