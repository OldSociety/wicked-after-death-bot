const traits = {
  'Huntsman Hyrum': {
    onCritReceived: (character) => {
      // Calculate buffer amount based on effective health
      const bufferAmount = Math.floor(character.effective_health * 0.1)

      // If buffer_health doesn't exist or is less than the calculated bufferAmount, add the buffer
      if (
        typeof character.buffer_health === 'undefined' ||
        character.buffer_health < bufferAmount
      ) {
        character.buffer_health = bufferAmount
      }
    },
  },

  'Blackguard Clara': {
    onCritReceived: (character, attacker) => {
      console.log("Blackguard Clara's trait is triggered!")
      if (Math.random() < 0.5) {
        applyCritDamage(attacker, character)
      }
    },
  },
}

function applyCritDamage(target, source) {
  const damage = source.effective_damage * 1.5
  target.current_health -= damage
  console.log(
    `${source.character_name} crits ${target.character_name} for ${damage}`
  )
}

module.exports = { traits, applyCritDamage }
