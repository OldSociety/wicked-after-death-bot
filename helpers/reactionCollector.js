const { EmbedBuilder } = require('discord.js')

async function setupQuestionReactionCollector(
  questionMessage,
  correctAnswerEmoji
) {
  const usersWhoAnswered = new Set() // Keep track of users who have answered

  const filter = (reaction, user) => {
    return !user.bot && !usersWhoAnswered.has(user.id) // Ensure the user hasn't already answered
  }

  const collector = questionMessage.createReactionCollector({
    filter,
    time: 300000, // 5 minutes for answering
  })

  collector.on('collect', async (reaction, user) => {
    usersWhoAnswered.add(user.id) // Add the user to the set of users who have answered

    // Direct message the user with feedback
    if (reaction.emoji.name === correctAnswerEmoji) {
      user.send('You answered correctly!').catch(console.error) // Handle the case where the user cannot receive DMs
    } else {
      user.send("Oops, that's not the right answer.").catch(console.error)
    }

    // Remove all reactions to mimic privacy
    try {
      await reaction.message.reactions.removeAll()
    } catch (error) {
      console.error('Failed to manage reactions:', error)
    }
  })

  collector.on('end', async () => {
    console.log('Question period has ended.')

    // Send a closing embed message to indicate the question period has ended
    const closingEmbed = new EmbedBuilder()
      .setColor('#FFFF00') // Yellow or any color you prefer
      .setTitle("Time's Up!")
      .setDescription(
        'The question period is now over. Stay tuned for more questions!'
      )
      .setTimestamp()

    await questionMessage.channel.send({ embeds: [closingEmbed] })

    // Optionally delete the original question embed to clean up the channel
    try {
      await questionMessage.delete()
    } catch (error) {
      console.error('Failed to delete the question message:', error)
    }
  })
}

module.exports = { setupQuestionReactionCollector }
