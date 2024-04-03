const { EmbedBuilder } = require('discord.js')
const sequelize = require('../config/sequelize')
const { User, WickedCards, UserCardCollection } = require('../Models/model.js')

// Utility function to transform rarity identifiers
function transformRarityIdentifier(rarity) {
  // Check if rarity is defined and is a string
  if (typeof rarity === 'string' && rarity.startsWith('ex')) {
    return 'exclusive ' + rarity.substring(2)
  }
  // Return the original rarity if it's defined, otherwise return a default string indicating an unknown rarity
  return rarity || 'Unknown Rarity'
}

// This function now specifically adjusts the selection based on the provided chances
async function fetchExEpicRewardWithAdjustedChances() {
  // Define rarities and their corresponding chances
  const raritiesWithChances = [
    { rarity: 'exRare', chance: 82.63 },
    { rarity: 'exEpic', chance: 12.44 },
    { rarity: 'exLegend', chance: 4.89 },
    { rarity: 'mythic', chance: 0.06 },
  ]

  // Calculate a random percentage for rarity selection
  let randomPercent = Math.random() * 100
  let selectedRarity = 'exRare' // Default selection

  for (const rarityWithChance of raritiesWithChances) {
    if (randomPercent <= rarityWithChance.chance) {
      selectedRarity = rarityWithChance.rarity
      break // Found the selected rarity
    }
    randomPercent -= rarityWithChance.chance // Adjust random percent after bypassing this rarity
  }

  // Fetch a card of the selected rarity
  const card = await WickedCards.findOne({
    where: { rarity: selectedRarity },
    order: [sequelize.fn('RANDOM')],
  })

  if (!card) {
    throw new Error(`No cards available for rarity: ${selectedRarity}`)
  }

  // Ensure you return an object with both name and rarity
  return {
    name: card.card_name,
    rarity: card.rarity,
  }
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
    id: card.id,
    name: card.card_name,
    rarity: card.rarity,
  }
}

async function setupFreeRewardCollector(rewardMessage) {

  const rewards = [
    8000, // Gold value
    10000,
    20000,
    await fetchCardByRarity(['legendary']), // Guaranteed Legendary
    await fetchExEpicRewardWithAdjustedChances(), // ExRare or higher
    Math.random() < 0.8
      ? await fetchCardByRarity(['epic'])
      : await fetchCardByRarity(['legendary']), // Primarily Epic, chance of Legendary
  ]

  while (rewards.length < 8) {
    rewards.push(await fetchCardByRarity(['rare', 'epic', 'legendary'])) // Random card from all rarities
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
      } else {
       
// Correct way to access the model based on your console.log output
const UserCardCollection = sequelize.models.UserCardCollections;

        // Handle card reward
        const [userCard, created] =
          await UserCardCollection.findOrCreate({
            where: { user_id: user.id, card_id: selectedReward.id },
            defaults: { quantity: 1 }, // Starting quantity if creating
          })

        if (!created) {
          // If the record already existed, increment quantity
          userCard.quantity += 1
          await userCard.save()
        }
      }
    }

    console.log(`Selected Reward:`, selectedReward)


    const feedbackEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Congratulations!')
      .setDescription(
        `${user.username}, you've selected ${reaction.emoji.name} and won ${
          typeof selectedReward === 'number'
            ? `🪙 ${selectedReward} gold`
            : `the ${transformRarityIdentifier(
                selectedReward.rarity
              )} card: **${selectedReward.name}**`
        }!`
      )

    // Update the original rewardMessage with the feedbackEmbed
    await rewardMessage.edit({ content: ' ', embeds: [feedbackEmbed] })

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
  })

  // React with options for users to choose their reward
  for (const emoji of emojis) {
    await rewardMessage.react(emoji)
  }
}

module.exports = { setupFreeRewardCollector }
