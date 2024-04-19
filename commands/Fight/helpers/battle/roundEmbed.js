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
    .setThumbnail(`${enemy.image}`)
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
      value: 'Choose a card to play.',
    })
  }

  // Add card details to the embed
  deck.slice(0, 5).forEach((card, index) => {
    embed.addFields({
      name: `${index + 1} ${card.name}`,
      value: `(Cost: ${card.cost}, Strength: ${card.strength})`,
      inline: false
    });
  });

  // Create buttons labeled 1-5 for each card
  const actionRow = new ActionRowBuilder();
  for (let i = 1; i <= 5; i++) {
    actionRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`card_${i - 1}_${battleKey}`) // Indexing from 0
        .setLabel(`${i}`)
        .setStyle(ButtonStyle.Primary)
    );
  }

  return { embeds: [embed], components: [actionRow], ephemeral: true }
}

module.exports = { createRoundEmbed }
