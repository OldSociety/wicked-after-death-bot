const { EmbedBuilder } = require('discord.js')
const { WickedCards } = require('../Models/model')
const { setupQuestionReactionCollector } = require('./reactionCollector')

async function postRandomQuestion(channel) {
  try {
    console.log(WickedCards)
    const questionCount = await WickedCards.count()
    if (questionCount === 0) throw new Error('No questions available.')

    const randomRow = Math.floor(Math.random() * questionCount)
    const randomQuestion = await WickedCards.findOne({
      where: {
        question_text: { [Sequelize.Op.not]: null },
        correct_answer: { [Sequelize.Op.not]: null },
      },
      offset: randomRow,
    })

    if (!randomQuestion) throw new Error('Question not found.')

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
    setupQuestionReactionCollector(
      questionMessage,
      correctAnswerEmoji,
      randomQuestion
    )
  } catch (error) {
    console.error('Error in postRandomQuestion:', error)
    channel.send('There was an error fetching a question.')
  }
}

module.exports = { postRandomQuestion }
