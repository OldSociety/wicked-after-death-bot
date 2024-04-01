const { EmbedBuilder } = require('discord.js')
const sequelize = require('../config/sequelize')
const { User, WickedCards } = require('../Models/model.js')

// Utility function to transform rarity identifiers
function transformRarityIdentifier(rarity) {
  if (rarity.startsWith('Ex')) {
    return 'Exclusive ' + rarity.substring(2)
  }
  return rarity
}

// Assuming you have a method in WickedCards to fetch cards by rarity
async function fetchCardByRarity(rarities) {
  const card = await WickedCards.findOne({
    where: { rarity: rarities },
    order: sequelize.random(),
  })

  if (!card)
    throw new Error(
      `No cards of specified rarities available: ${rarities.join(', ')}.`
    )

  // Return an object with both the card name and its rarity
  return {
    name: card.card_name,
    rarity: card.rarity,
  }
}

async function setupFreeRewardCollector(rewardMessage) {
  const rewards = [
    8000, // Gold value
    10000, // Gold value
    20000, // Gold value
    await fetchCardByRarity(['Legendary']), // Guaranteed Legendary
    await fetchCardByRarity(['ExRare', 'ExEpic', 'ExLegend', 'Mythic']), // ExRare or higher
    Math.random() < 0.8
      ? await fetchCardByRarity(['Epic'])
      : await fetchCardByRarity(['Legendary']), // Primarily Epic, chance of Legendary
  ]

  // Fill the rest of the rewards with random cards, assuming a simple random selection here
  // Adjust your selection mechanism as needed based on your game's design
  while (rewards.length < 8) {
    rewards.push(
      await fetchCardByRarity([
        'Common',
        'Uncommon',
        'Rare',
        'Epic',
        'Legendary',
      ])
    ) // Random card from all rarities
  }

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
    usersWhoClaimed.add(user.id) // Mark user as having claimed

    // Determine selected reward
    const selectedEmojiIndex = emojis.indexOf(reaction.emoji.name)
    const selectedReward = rewards[selectedEmojiIndex]

    // Fetch user data
    const userData = await User.findOne({ where: { user_id: user.id } })

    if (!userData) {
      console.error(`User with ID ${user.id} not found.`)
      // Handle error, for example by sending a message to the user
    } else {
      // Check if the selected reward is gold (i.e., a number)
      if (typeof selectedReward === 'number') {
        // Add the gold amount to the user's balance
        userData.balance += selectedReward
        await userData.save() // Save the updated user data to the database
      }
    }

    // Construct feedback embed
    const feedbackEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Congratulations!')
      .setDescription(
        `${user.username}, you've selected ${reaction.emoji.name} and won ${
          typeof selectedReward === 'number'
            ? '🪙' + selectedReward + ' gold'
            : `the ${transformRarityIdentifier(selectedReward.rarity)} card: **${
                selectedReward.name
              }**`
        }!`
      )

    // Update the original rewardMessage with the feedbackEmbed
    await rewardMessage.edit({ content: ' ', embeds: [feedbackEmbed] })

    // Optionally, handle updating user's reward in your database here
    console.log(`User ${user.tag} won ${selectedReward}`)

    // Disable further reactions by removing all reactions from the message
    try {
      await rewardMessage.reactions.removeAll()
    } catch (error) {
      console.error('Failed to remove reactions:', error)
    }
  })

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
