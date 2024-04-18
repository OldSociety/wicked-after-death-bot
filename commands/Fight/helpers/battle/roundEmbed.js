const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js')

const createRoundEmbed = (actions, character, enemy, battleKey, deck) => {
  const combatDescription =
    character.character_name && enemy.character_name
      ? `Combat: ${character.character_name} vs. ${enemy.character_name}`
      : 'Combat has begun!'

  const embed = new EmbedBuilder()
    .setDescription(combatDescription)
    .setColor('DarkRed')
    .setFooter({ text: `In combat with ${enemy.character_name}` })

  if (actions && actions.length > 0) {
    actions.forEach((action) => {
      let actionDesc = action.didMiss
        ? `${action.attacker.character_name} was partially blocked.`
        : `${action.attacker.character_name} ${
            action.isCrit ? 'landed a critical hit!' : 'strikes'
          } for ${action.isCrit ? '💥' : '⚔️'}${action.actualDamage} damage`

      embed.addFields({
        name: '\u200B', // Zero-width space
        value: '```' + `${actionDesc}` + '```',
      })
    })
  } else {
    // If there are no actions, assume it's preparation time
    embed.addFields({
      name: 'Prepare for Battle',
      value: 'Choose your action and fight!',
    });

    
  }

  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`battle_light_${battleKey}`)
      .setLabel('🗡️')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`battle_heavy_${battleKey}`)
      .setLabel('⚔️')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`battle_block_${battleKey}`)
      .setLabel('🛡️')
      .setStyle(ButtonStyle.Secondary)
  )

  return { embeds: [embed], components: [actionRow], ephemeral: true }
}

module.exports = { createRoundEmbed }
