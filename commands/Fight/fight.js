const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { retrieveCharacters } = require('./helpers/characterRetrieval')
const { createCharacterSelectMenu } = require('./helpers/characterSelection')
const { selectEnemy } = require('./helpers/enemySelection')

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('fight')
    .setDescription('Engage in combat'),

  async execute(interaction) {
    const userId = interaction.user.id
    const characterRetrieved = false

    // User character selection
    const userCharacters = await retrieveCharacters(userId)
    if (!userCharacters.length) {
      await interaction.reply('You have no characters to select.')
      return
    }

    const actionRow = createCharacterSelectMenu(userCharacters)

    const characterEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Character Selection')
      .setDescription('Please select a character for the fight:')

    await interaction.reply({
      embeds: [characterEmbed],
      components: [actionRow],
      ephemeral: true,
    })

    // Enemy selection
    let enemy
    try {
      enemy = await selectEnemy()
    } catch (err) {
      await interaction.followUp('No enemies available for selection.')
      return
    }

    const enemyEmbed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('Enemy Selection')
      .setDescription(`Your opponent is ${enemy.name}`)
    // .addField('Description', enemy.description)

    await interaction.followUp({
      embeds: [enemyEmbed],
    })

    // Further code can go here to initiate the actual fight.
  },
}
