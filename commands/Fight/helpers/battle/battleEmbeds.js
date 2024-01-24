const { EmbedBuilder } = require('discord.js')

const createRoundEmbed = (
  actions,
  userName,
  frontlaneCharacter,
  backlaneCharacter,
  enemy,
  turnNum
) => {
  // console.log("Received actions:", actions); // Log the actions array
  const embed = new EmbedBuilder().setTitle(`Battle Status: Turn ${turnNum}`)

  actions.forEach((action, index) => {
    // console.log(`Processing action ${index}:`, action); // Log each action

    let actionDesc = action.didMiss
      ? `${action.attacker.character_name} missed.`
      : `${action.attacker.character_name} ${
          action.isCrit ? 'landed a critical hit!' : 'strikes'
        } for ${action.isCrit ? '💥' : '⚔️'}${action.actualDamage} damage`


    // Example usage: health bar [■■■■■■■■■■■■■■■■■■■■]

    let healthDesc
    if (action.defender.character_name === frontlaneCharacter.character_name) {
      healthDesc = `${createHealthBar(
        frontlaneCharacter.current_health,
        frontlaneCharacter.effective_health
      )}\n\n${backlaneCharacter.character_name}'s health ${createBacklaneHealthBar(
        backlaneCharacter.current_health,
        backlaneCharacter.effective_health
      )}`

    } else if (
      action.defender.character_name === backlaneCharacter.character_name
    ) {
      healthDesc = createHealthBar(
        backlaneCharacter.current_health,
        backlaneCharacter.effective_health
      )
    } else {
      // Assuming the only other option is the enemy
      healthDesc = createHealthBar(enemy.current_health, enemy.effective_health)
    }

    embed.addFields(
      { name: '`' + `Action` + '`', value: actionDesc },
      { name: `\n${action.defender.character_name}'s Health`, value: healthDesc }
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
  const totalSegments = 20; // Number of segments in the health bar
  const filledSegments = Math.round((currentHealth / maxHealth) * totalSegments);
  const bufferSegments = Math.round((bufferHealth / maxHealth) * totalSegments);
  const unfilledSegments = totalSegments - filledSegments - bufferSegments;

  const filledBar = ('🟥').repeat(filledSegments);
  const bufferBar = ('🟦').repeat(bufferSegments); // Represent buffer with a blue square
  const unfilledBar = ('⬛').repeat(unfilledSegments);

  return '`' + '『' + `${filledBar}${bufferBar}${unfilledBar}` + '』' + '`';
}

function createBacklaneHealthBar(currentHealth, maxHealth, bufferHealth = 0) {
  const totalSegments = 20; // Number of segments in the health bar
  const filledSegments = Math.round((currentHealth / maxHealth) * totalSegments);
  const bufferSegments = Math.round((bufferHealth / maxHealth) * totalSegments);
  const unfilledSegments = totalSegments - filledSegments - bufferSegments;

  const filledBar = ('■').repeat(filledSegments);
  const unfilledBar = ('□').repeat(unfilledSegments);

  return '`' + '『' + `${filledBar}${unfilledBar}` + '』' + '`';
}

// Example usage
// const healthBar = createHealthBar(50, 100, 10); // Current health 50, Max health 100, Buffer health 10
// console.log(healthBar);

module.exports = { createRoundEmbed }
