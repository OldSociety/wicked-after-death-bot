const cron = require('node-cron')
const { User, GearParts, UserGearParts } = require('../Models/model')

function pickRarity() {
  const rand = Math.random() * 100
  if (rand < 60) return 'common'
  if (rand < 90) return 'uncommon'
  return 'rare'
}

async function scavengeGearParts(userId, chanceToFind) {
  if (Math.random() < chanceToFind) {
    const rarity = pickRarity()
    const allParts = await GearParts.findAll({ where: { rarity } })
    const randomPart = allParts[Math.floor(Math.random() * allParts.length)]

    const [userGearPart, created] = await UserGearParts.findOrCreate({
      where: { user_id: userId, parts_id: randomPart.parts_id },
      defaults: { quantity: 0 },
    })

    await userGearPart.increment('quantity', { by: 1 })
    console.log('I have found a part for ' + userId)
  }
}


cron.schedule('0 * * * *', async () => {  // Schedule cron job to run every hour
  try {
    console.log('.')
    // Fetch all unique user_ids from UserGearParts model
    const uniqueUserIds = await UserGearParts.findAll({
      attributes: ['user_id'],
      group: ['user_id'],
    })

    // Loop through each unique user_id and call scavengeGearParts
    for (const uniqueUser of uniqueUserIds) {
      const chanceToFind = 0.05 // Set this dynamically per user if needed
      await scavengeGearParts(uniqueUser.user_id, chanceToFind)
    }
  } catch (error) {
    console.error('Error in scheduled task:', error)
  }
})
