const { EmbedBuilder } = require('discord.js')

const traits = {
  'Huntsman Hyrum': {
    onCritReceived: (character, attacker, channel) => {
      // Calculate buffer amount based on effective health
      const bufferAmount = Math.floor(character.effective_health * 0.1)

      // If buffer_health doesn't exist or is less than the calculated bufferAmount, add the buffer
      if (
        typeof character.buffer_health === 'undefined' ||
        character.buffer_health < bufferAmount
      ) {
        character.buffer_health = bufferAmount
      }
      // Embed to show that buffer has been activated
      const bufferEmbed = new EmbedBuilder()
        .setTitle('Buffer Activated!')
        .setDescription(`${character.character_name} has activated a buffer!`)
        .addFields({
          name: 'Buffer Amount',
          value: bufferAmount.toString(),
        })

      channel.send({ embeds: [bufferEmbed] })
    },
  },

  'Blackguard Clara': {
    onCritReceived: (character, attacker, channel) => {
      console.log(`Blackguard Clara's trait is triggered!`);
      if (Math.random() < 0.5) {
        const [minDamage, maxDamage, isCrit] = calcDamage(character, 0);  // Always crit
        const actualDamage = calcActualDamage(minDamage, maxDamage);  
        return actualDamage; // Return the damage that will be used in applyDamage
      }
      return null; // Return null if the trait doesn't activate
    },
  },
}  

function applyCritDamage(target, actualDamage) {
    target.current_health -= actualDamage;
    console.log(`${source.character_name} crits ${target.character_name} for ${actualDamage}`);
  }
  

module.exports = { traits, applyCritDamage }
