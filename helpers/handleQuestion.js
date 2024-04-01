const { EmbedBuilder } = require('discord.js');
const { Op } = require('sequelize'); // Make sure to import Op
const sequelize = require('../config/sequelize');
const { WickedCards } = require('../Models/model');
const { setupQuestionReactionCollector } = require('./reactionCollector');

async function postRandomQuestion(channel) {
  try {
    // Get IDs of all questions with included rarities
    const questions = await WickedCards.findAll({
      attributes: ['id'],
      where: {
        rarity: {
          [Op.in]: ['common', 'rare', 'epic', 'legendary'], // Filter by included rarities
        },
      },
    });

    if (questions.length === 0) throw new Error('No questions available.');

    // Select a random question ID from the list
    const randomIndex = Math.floor(Math.random() * questions.length);
    const randomQuestionId = questions[randomIndex].id;

    // Fetch the randomly selected question by ID
    const randomQuestion = await WickedCards.findByPk(randomQuestionId);
    if (!randomQuestion) throw new Error('Question not found.');

    const options = ['🇦', '🇧', '🇨', '🇩']
    const answers = [
      randomQuestion.answer_1,
      randomQuestion.answer_2,
      randomQuestion.answer_3,
      randomQuestion.answer_4,
    ].filter(Boolean)
    const correctAnswerMapping = { A: '🇦', B: '🇧', C: '🇨', D: '🇩' }
    const correctAnswerEmoji =
      correctAnswerMapping[randomQuestion.correct_answer]

    const questionEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Random Question Time!')
      .setDescription(randomQuestion.question_text)
      .addFields({
        name: 'Options',
        description: 'PLEASE KEEPING VOTING TO HELP IN TESTING.',
        value: answers
          .map((answer, index) => `${options[index]} ${answer}`)
          .join('\n'),
        inline: true,
      })
      .setTimestamp()

    const questionMessage = await channel.send({ embeds: [questionEmbed] })
    options
      .slice(0, answers.length)
      .forEach(async (option) => await questionMessage.react(option))

    // Now, setup the reaction collector for this question
    setupQuestionReactionCollector(questionMessage, correctAnswerEmoji, randomQuestion)
  } catch (error) {
    console.error('Error in postRandomQuestion:', error)
    channel.send('There was an error fetching a question.')
  }
}

module.exports = { postRandomQuestion }
