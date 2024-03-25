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
    if (interaction.user.id !== process.env.BOTADMINID) {
      await interaction.reply({
        content: 'You are not authorized to use this command.',
        ephemeral: true,
      })
      return
    }

    try {
      if (interaction.options.getSubcommand() === 'add') {
        const deckName = interaction.options.getString('name')
        const [deck, created] = await Deck.findOrCreate({
          where: { deck_name: deckName },
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
    } catch (error) {
      console.error('Error in account management command:', error) // Existing log
      await interaction.reply({
        content: 'An error occurred. Please try again later.',
        ephemeral: true,
      })
    }
  },
}

async function importQuestionsFromJson(jsonData, deckName, interaction) {
    let questionsData;
    try {
      questionsData = JSON.parse(jsonData);
    } catch (error) {
      await interaction.reply({
        content: 'Failed to parse JSON data. Please check the format and try again.',
        ephemeral: true,
      });
      return;
    }
  
    // Ensure deckName is in lowercase when used for findOrCreate
    deckName = deckName.toLowerCase(); // Convert deck name to lowercase
    const [deck, created] = await Deck.findOrCreate({
      where: { deck_name: deckName }, // Make sure this matches your model's column name, it might be just 'name'
    });
  
    for (const questionObj of questionsData) {
      await Question.create({
        ...questionObj,
        deck_id: deck.id, // Ensure this matches how you're actually storing the deck ID
      });
    }
  
    await interaction.reply(`Questions imported to "${deckName}" deck successfully.`);
  }
  