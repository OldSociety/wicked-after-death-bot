const { EmbedBuilder } = require('discord.js');

const createRoundEmbed = (actions, userName, frontlaneCharacter, backlaneCharacter, enemy, turnNum) => {
  // console.log("Received actions:", actions); // Log the actions array
  const embed = new EmbedBuilder().setTitle(`Battle Status: Turn ${turnNum}`);

  actions.forEach((action, index) => {
    // console.log(`Processing action ${index}:`, action); // Log each action

    let actionDesc = action.didMiss
      ? `${action.attacker.character_name} missed.`
      : `${action.attacker.character_name} ${action.isCrit ? 'landed a critical hit!' : 'strikes'} for ${action.isCrit ? '💥' : '⚔️'}${action.actualDamage} damage`;

      let healthDesc;

      if (action.defender.character_name === frontlaneCharacter.character_name) {
        healthDesc = `🧡 ${frontlaneCharacter.current_health}`;
      } else if (action.defender.character_name === backlaneCharacter.character_name) {
        healthDesc = `🧡 ${backlaneCharacter.current_health}`;
      } else {
        // Assuming the only other option is the enemy
        healthDesc = `🧡 ${enemy.current_health}`;
      }
      

    embed.addFields(
      { name: `Action`, value: actionDesc },
      { name: `${action.defender.character_name}'s Health`, value: healthDesc }
    );

    if (action.bufferDamage > 0) {
      const initialBufferHealth = action.defender.buffer_health + action.bufferDamage;
      const remainingBufferHealth = action.defender.buffer_health;

      embed.addFields({
        name: `${action.defender.character_name}'s Buffer`,
        value: `Activated 🛡️\nInitial: ${initialBufferHealth} ➡️ Damage Absorbed: ${action.bufferDamage} ➡️ Remaining: ${remainingBufferHealth}`
      });
    }
  });

  // console.log("Embed fields:", embed.data.fields); // Log the fields added to the embed
  return embed;
};

module.exports = { createRoundEmbed };
