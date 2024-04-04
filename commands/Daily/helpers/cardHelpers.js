const sequelize = require('../../../config/sequelize.js')
const { WickedCards } = require('../../../Models/model.js')

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

async function fetchCardByRarity(rarities) {
  const card = await WickedCards.findOne({
    where: { rarity: rarities },
    order: sequelize.random(),
  })

  if (!card)
    throw new Error(
      `No cards of specified rarities available: ${rarities.join(', ')}.`
    )

  return {
    id: card.id, 
    name: card.card_name,
    rarity: card.rarity,
  }
}

module.exports = { fetchCardByRarity, fetchExEpicRewardWithAdjustedChances }
