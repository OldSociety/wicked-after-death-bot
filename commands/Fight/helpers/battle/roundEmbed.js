const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js')

const createRoundEmbed = (actions, userName, character, enemy, turnNum) => {
  // console.log("Received actions:", actions); // Log the actions array
  const embed = new EmbedBuilder()
    .setTitle(`${character.character_name}'s Action`)
    .setColor('DarkRed')
    .setFooter({ text: `In combat with  ${enemy.character_name}, ${turnNum}` })

  actions.forEach((action, index) => {
    let actionDesc = action.didMiss
      ? `${action.attacker.character_name} was partially blocked.`
      : `${action.attacker.character_name} ${
          action.isCrit ? 'landed a critical hit!' : 'strikes'
        } for ${action.isCrit ? '💥' : '⚔️'}${action.actualDamage} damage`

    let healthDesc
    let healthFieldName

    if (action.defender.character_name === character.character_name) {
      {
        // Regular health bar display for character
        healthFieldName = `\n${action.defender.character_name}'s Health`
        healthDesc = createHealthBar(
          character.current_health,
          character.effective_health
        )
      }
    } else {
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
    // .setThumbnail(
    //   'https://cdn.discordapp.com/attachments/1149795132426694826/1199900841944031373/IMG_8846.webp?ex=65c439bd&is=65b1c4bd&hm=078c43059c889e84e9ed20cb97ddda4cf0c6c157780635bb2e542ab2b49ae647&'
    // )

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
  return '`' + '『' + `${filledBar}${bufferBar}${unfilledBar}` + '』' + '`'
}

const createPlayerActionEmbed = (character) => {
  const playerActionEmbed = new EmbedBuilder()
    .setTitle(`${character.character_name}'s Turn`)
    .setDescription('Select your action:')
    .setColor('DarkGreen')
    .addFields({
      name: 'Light Attack',
      value: 'React with ⚔️ to perform a Light Attack.',
      inline: true,
    })

  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('light_attack')
      .setLabel('⚔️')
      .setStyle(ButtonStyle.Primary)
  )

  return { embeds: [playerActionEmbed], components: [actionRow] }
}

module.exports = { createRoundEmbed, createPlayerActionEmbed }
