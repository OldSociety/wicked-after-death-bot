const { EmbedBuilder } = require('discord.js')

const createRoundEmbed = (actions, userName, character1, character2) => {
  const embed = new EmbedBuilder().setTitle(`${userName}'s Battle Status`)

  actions.forEach((action) => {
    embed.addFields(
 
      {
        name: `${action.attacker.character_name}'s Action`,
        value: action.didMiss
          ? `${action.attacker.character_name} missed an attack on ${action.defender.character_name}`
          : `${action.attacker.character_name} dealt ${action.actualDamage} damage to ${action.defender.character_name}`,
      },
      {
        name: `${action.defender.character_name}'s Health`,
        value: action.defender.character_name === character1.character_name
          ? '`🧡' +
          character1.current_health.toString() +
          '`'
          : '`🧡' +
          character2.current_health.toString() +
          '`',
      }
    )

    if (action.bufferDamage > 0) {
      embed.addFields({
        name: 'Buffer Damage Absorbed',
        value: `${action.bufferDamage}`,
      })
    }

    if (action.isCrit) {
      embed.addFields({
        name: 'Critical',
        value: `${action.attacker.character_name} landed a critical hit!`,
      })
    }
  })

  return embed
}

module.exports = { createRoundEmbed }
