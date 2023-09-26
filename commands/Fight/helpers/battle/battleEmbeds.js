const { EmbedBuilder } = require('discord.js')

const createRoundEmbed = (
  actions,
  userName,
  character1,
  character2,
  turnNum
) => {
  const healthPercent =
    (character1.current_health / character1.effective_health) * 100

  const embed = new EmbedBuilder().setTitle(`Battle Status: Turn ${turnNum}`)

  actions.forEach((action) => {
    embed.addFields(
      {
        name: `Action`,
        value: action.didMiss
          ? `${action.attacker.character_name} missed.`
          : `${action.attacker.character_name} strikes for ` +
            '`' +
            `⚔️${action.actualDamage} damage` +
            '`.',
      },
      {
        name: `${action.defender.character_name}'s Health`,
        value:
          action.defender.character_name === character1.character_name
            ? '`🧡' + character1.current_health.toString() + '`'
            : '`🧡' + character2.current_health.toString() + '`',
      }
    )

    if (action.bufferDamage > 0) {
      embed.addFields({
        name: 'Buffer Damage Absorbed',
        value: '`🛡️' + `${action.bufferDamage}` + '`',
      })
    }

    if (action.isCrit) {
      embed.addFields({
        name: 'Critical',
        value:
          `${action.attacker.character_name} landed a critical hit! ` +
          '`' +
          `💥${action.actualDamage} damage` +
          '`',
      })
    }

    // This is just not working at allowedNodeEnvironmentFlags.
    // console.log(character1.sp1Counter)
    //     if ("counter for embed", character1.sp1Counter > 0) {
    //         embed.addFields({
    //           name: 'Special Ability',
    //           value: 'SP1 is ready! Click the button to activate!',
    //         });
    //       }
  })

  return embed
}

module.exports = { createRoundEmbed }
