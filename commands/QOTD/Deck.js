const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { DataTypes, Sequelize } = require('sequelize')
const sequelize = require('../../config/sequelize.js')

const { Deck, Question } = require('../../Models/model.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deck')
    .setDescription('Interact with QOTD decks')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Add a deck')
        .addStringOption((option) =>
          option
            .setName('name')
            .setDescription('The name of the deck')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('upload')
        .setDescription('Upload questions to a deck from a JSON file')
        .addStringOption((option) =>
          option
            .setName('name')
            .setDescription('The name of the deck')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('data')
            .setDescription('The JSON data of questions')
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    console.log("Deck?", Question)
    console.log("Question?", Question)
    if (interaction.options.getSubcommand() === 'add') {
      const deckName = interaction.options.getString('name')
      const [deck, created] = await Deck.findOrCreate({
        where: { name: deckName },
      })

      if (created) {
        await interaction.reply(`Deck "${deckName}" created successfully.`)
      } else {
        await interaction.reply(`Deck "${deckName}" already exists.`)
      }
    } else if (interaction.options.getSubcommand() === 'upload') {
      const deckName = interaction.options.getString('name')
      const jsonData = interaction.options.getString('data')
      await importQuestionsFromJson(jsonData, deckName, interaction)
    }
  },
}

async function importQuestionsFromJson(jsonData, deckName, interaction) {
  let questionsData
  try {
    questionsData = JSON.parse(jsonData)
  } catch (error) {
    await interaction.reply({
      content:
        'Failed to parse JSON data. Please check the format and try again.',
      ephemeral: true,
    })
    return
  }

  const [deck, created] = await Deck.findOrCreate({
    where: { deck_name: deckName },
  })

  for (const questionObj of questionsData) {
    await Question.create({
      ...questionObj,
      deck_id: deck.deck_id, // Adjust based on your actual model's foreign key
    })
  }

  await interaction.reply(
    `Questions imported to "${deckName}" deck successfully.`
  )
}
