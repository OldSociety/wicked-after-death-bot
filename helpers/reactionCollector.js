const { EmbedBuilder } = require('discord.js')
const { User } = require('../Models/model.js')

async function setupQuestionReactionCollector(
  questionMessage,
  correctAnswerEmoji
) {
  const usersWhoAnswered = new Set() // Keep track of users who have answered
  const userId = User.user_id
  const filter = (reaction, user) => {
    return !user.bot && !usersWhoAnswered.has(user.user_id) // Ensure the user hasn't already answered
  }

  const collector = questionMessage.createReactionCollector({
    filter,
    time: 600000, // 5 minutes for answering
  })

  collector.on('collect', async (reaction, user) => {
    usersWhoAnswered.add(user.id) // Track that the user has answered

    if (reaction.emoji.name === correctAnswerEmoji) {
      // Direct message the user with feedback
      user.send('You answered correctly!').catch(console.error) // Handle the case where the user cannot receive DMs

      // Look up the user in the database using `user_id` which matches the Discord user's ID
      const userData = await User.findOne({ where: { user_id: user.id } })

      if (userData) {
        // User found, award points
        userData.fate_points += 1 // Adjust the points accordingly
        await userData.save()

        // Optionally, notify the user of their new points total
        user
          .send(
            `You've been awarded 1 fate point! You now have ${userData.fate_points} fate points.`
          )
          .catch(console.error)
      } else {
        // Handle the case where there is no user data found, potentially prompting the user to register
        console.log(`No user data found for ID: ${user.id}`)
      }
    } else {
      user.send("Oops, that's not the right answer.").catch(console.error)
    }

    // Attempt to remove the user's reaction to maintain privacy
    try {
      await reaction.users.remove(user.user_id)
    } catch (error) {
      console.error('Failed to manage reactions:', error)
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
