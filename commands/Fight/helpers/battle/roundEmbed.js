const { EmbedBuilder } = require('discord.js')

const createRoundEmbed = (
  actions,
  userName,
  character,
  enemy,
  turnNum
) => {
  // console.log("Received actions:", actions); // Log the actions array
  const embed = new EmbedBuilder()
    .setTitle(`Battle Status: Turn ${turnNum}`)
    .setColor('DarkBlue')
    .setThumbnail('https://i.imgur.com/AfFp7pu.png')

  actions.forEach((action, index) => {
    console.log(2)
    let actionDesc = action.didMiss
      ? `${action.attacker.character_name} was partially blocked.`
      : `${action.attacker.character_name} ${
          action.isCrit ? 'landed a critical hit!' : 'strikes'
        } for ${action.isCrit ? '💥' : '⚔️'}${action.actualDamage} damage`

    let healthDesc
    let healthFieldName

    if (action.defender.character_name === character.character_name) {
      {
        // Regular health bar display for frontlane character
        healthFieldName = `\n${action.defender.character_name}'s Health`
        healthDesc = createHealthBar(
          character.current_health,
          character.effective_health
        )
      }
    } else {
      // Assuming the only other option is the enemy
      healthFieldName = `\n${action.defender.character_name}'s Health`
      healthDesc = createHealthBar(enemy.current_health, enemy.effective_health)
    }

    embed.addFields(
      {
        name: '\u200B', // Zero-width space
        value: actionDesc,
      },
      {
        name: healthFieldName,
        value: healthDesc,
      }
    )

    if (action.bufferDamage > 0) {
      const initialBufferHealth =
        action.defender.buffer_health + action.bufferDamage
      const remainingBufferHealth = action.defender.buffer_health

      embed.addFields({
        name: `${action.defender.character_name}'s Buffer`,
        value: `Activated 🛡️\nInitial: ${initialBufferHealth} ➡️ Damage Absorbed: ${action.bufferDamage} ➡️ Remaining: ${remainingBufferHealth}`,
      })
    }
  })

  // console.log("Embed fields:", embed.data.fields); //
  return embed
}

function createHealthBar(currentHealth, maxHealth, bufferHealth = 0) {
  const totalSegments = 20 // Number of segments in the health bar
  
  // Calculate filled segments; ensure at least one if current health is greater than 0
  let filledSegments = Math.round((currentHealth / maxHealth) * totalSegments)
  if (currentHealth > 0 && filledSegments < 1) {
    filledSegments = 1
  }

  const bufferSegments = Math.round((bufferHealth / maxHealth) * totalSegments)

  // Adjust unfilled segments to account for minimum one filled segment
  let unfilledSegments = totalSegments - filledSegments - bufferSegments
  if (unfilledSegments > totalSegments) {
    unfilledSegments = totalSegments
  }

  const filledBar = '🟥'.repeat(filledSegments)
  const bufferBar = '🟦'.repeat(bufferSegments) // Represent buffer with a blue square
  const unfilledBar = '⬛'.repeat(unfilledSegments)
  console.log(3)
  return '`' + '『' + `${filledBar}${bufferBar}${unfilledBar}` + '』' + '`'
}

// Example usage
// const healthBar = createHealthBar(50, 100, 10); // Current health 50, Max health 100, Buffer health 10
// console.log(healthBar);

module.exports = { createRoundEmbed }
