const { EmbedBuilder } = require('discord.js')
const { User } = require('../Models/model.js')

async function setupQuestionReactionCollector(
  questionMessage,
  correctAnswerEmoji
) {
  const usersWhoAnswered = new Set() // Keep track of users who have answered
  const filter = (reaction, user) => {
    return !user.bot && !usersWhoAnswered.has(user.user_id) // Ensure the user hasn't already answered
  }

  const collector = questionMessage.createReactionCollector({
    filter,
    time: 600000, // 5 minutes for answering
  })

  collector.on('collect', async (reaction, user) => {
    // Attempt to remove just the reacting user's reaction to maintain privacy
    try {
      await reaction.users.remove(user.id) // Use user.id here
    } catch (error) {
      console.error('Failed to remove reaction:', error)
      return // Stop further processing if there's an error removing the reaction
    }

    // Proceed only if the user hasn't answered yet
    if (usersWhoAnswered.has(user.id)) {
      return // Exit if the user has already answered
    }

    usersWhoAnswered.add(user.id) // Mark the user as having answered

    let feedbackEmbed

    // Check if the answer is correct and construct feedback embed accordingly
    if (reaction.emoji.name === correctAnswerEmoji) {
      // Correct answer logic
      const userData = await User.findOne({ where: { user_id: user.id } })
      if (userData) {
        userData.fate_points += 1 // Increment fate points
        await userData.save() // Save the updated user data
        feedbackEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('Correct Answer!')
          .setDescription('You answered correctly!')
          .setFooter({
            text: `You have been awarded 1 fate point. You now have ${userData.fate_points} fate points.`,
          })
      } else {
        console.log(`No user data found for ID: ${user.id}`)
        feedbackEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('Correct Answer!')
          .setDescription('You answered correctly!')
          .setFooter({
            text: `You don't have an account. Use '/account' in the #wicked-after-death channel to create one.`,
          })

        return // Exit if no user data is found
      }
    } else {
      // Incorrect answer logic
      feedbackEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Incorrect Answer!')
        .setDescription("Oops, that's not the right answer.")
        .setFooter({ text: 'Better luck next time!' })
    }

    // Send the feedback embed as a DM
    try {
      await user.send({ embeds: [feedbackEmbed] })
    } catch (error) {
      console.error('Failed to send DM:', error)
    }
  })

  collector.on('end', async () => {
    console.log('Question period has ended.')
    global.isQuestionActive = false // Reset the flag when the question period ends
    global.messageCounter = 0
    console.log(global.isQuestionActive, global.messageCounter)

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
