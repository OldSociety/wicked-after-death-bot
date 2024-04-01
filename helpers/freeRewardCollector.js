const { EmbedBuilder } = require('discord.js')
const { User } = require('../Models/model.js')

async function setupFreeRewardCollector(rewardMessage) {
  const rewards = [100, 200, 300, 400, 500, 600, 700, 800]
  const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣']
  // Shuffle rewards function
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }
  // Shuffle rewards before mapping to emojis
  shuffleArray(rewards)

  const usersWhoClaimed = new Set() // Keep track of users who have claimed

  const filter = (reaction, user) => {
    return (
      !user.bot &&
      emojis.includes(reaction.emoji.name) &&
      !usersWhoClaimed.has(user.id)
    )
  }

  const collector = rewardMessage.createReactionCollector({
    filter,
    time: 60000, // 1 minute for selection
  })

  collector.on('collect', async (reaction, user) => {
    usersWhoClaimed.add(user.id); // Mark user as having claimed
  
    // Determine selected reward
    const selectedEmojiIndex = emojis.indexOf(reaction.emoji.name);
    const selectedReward = rewards[selectedEmojiIndex];
  
    // Construct feedback embed
    const feedbackEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Congratulations!')
      .setDescription(`${user.username}, you've selected ${reaction.emoji.name} and won ${selectedReward} coins!`);
  
    // Update the original rewardMessage with the feedbackEmbed
    await rewardMessage.edit({ content: ' ', embeds: [feedbackEmbed] });
  
    // Optionally, handle updating user's reward in your database here
    console.log(`User ${user.tag} won ${selectedReward} coins.`);
  
    // Disable further reactions by removing all reactions from the message
    try {
      await rewardMessage.reactions.removeAll();
    } catch (error) {
      console.error('Failed to remove reactions:', error);
    }
  });
  

  collector.on('end', (collected) => {
    if (collected.size === 0) {
      console.log('No selections were made.')
    }
    // Optionally, clean up the message or provide further instructions
  })

  // React with options for users to choose their reward
  for (const emoji of emojis) {
    await rewardMessage.react(emoji)
  }
}

module.exports = { setupFreeRewardCollector }
