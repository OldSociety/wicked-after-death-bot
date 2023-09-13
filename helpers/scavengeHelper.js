const cron = require('node-cron')
const { Op } = require('sequelize')
const { User, GearParts, UserGearParts } = require('../Models/model')

const baseChance = 0.05
const maxChanceIncrease = 0.1
const chanceIncrement = 0.01

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

const lastCountedMessageTimestamp = {}

cron.schedule('* * * * *', async () => { // '*/6 * * * *' <- 6 minutes
  try {
    const currentTime = new Date()

    const activeUsers = await User.findAll({
      attributes: ['user_id'],
      where: {
        last_counted_message_timestamp: {
          [Op.gte]: new Date(currentTime - 360000),
        },
      },
    })

    for (const user of activeUsers) {
      user.chanceToFind = Math.min(
        user.chanceToFind + chanceIncrement,
        baseChance + maxChanceIncrease
      )

      user.message_count = (user.message_count || 0) + 1
      await user.save()
    }

    for (const user of activeUsers) {
      if (
        Date.now() - (lastCountedMessageTimestamp[user.user_id] || 0) >=
        6 * 60 * 1000
      ) {
        user.chanceToFind = Math.min(
          user.chanceToFind + chanceIncrement,
          baseChance + maxChanceIncrease
        )
        user.message_count = (user.message_count || 0) + 1
        lastCountedMessageTimestamp[user.user_id] = Date.now() // Update the last counted time
        await user.save()
        console.log(`User ID: ${user.user_id}, Current chance to find: ${user.chanceToFind}`); // Added log
      }
    }
  } catch (error) {
    console.error('Error in scheduled task:', error)
  }
})

cron.schedule('0 * * * *', async () => {
  try {
    const currentTime = new Date()

    const uniqueUserIds = await UserGearParts.findAll({
      attributes: ['user_id'],
      group: ['user_id'],
    })

    for (const uniqueUser of uniqueUserIds) {
      const user = await User.findOne({
        where: { user_id: uniqueUser.user_id },
      })
      await scavengeGearParts(user.user_id, user.chanceToFind)
    }

    await User.update({ last_counted_message_timestamp: currentTime }, { where: {} })
    await User.update({ chanceToFind: baseChance }, { where: {} })
  } catch (error) {
    console.error('Error in scheduled task:', error)
  }
})

module.exports = {
  scavengeHelper: async (message) => {
    try {
      const userId = message.author.id
      const user = await User.findOne({ where: { user_id: userId } })
      if (user) {
        const chanceToFind = user.chanceToFind || baseChance
        await scavengeGearParts(userId, chanceToFind)
      }
    } catch (error) {
      console.error('Error handling incoming message:', error)
    }
  },
}
