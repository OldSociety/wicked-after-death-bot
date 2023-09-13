const cron = require('node-cron')
const { Op } = require('sequelize')
const { User, GearParts, UserGearParts } = require('../Models/model')

const baseChance = 0.5
const maxChanceIncrease = 0.1
const chanceIncrement = 0.01
const userChanceToFind = {}

function pickRarity() {
  const rand = Math.random() * 100
  if (rand < 60) return 'common'
  if (rand < 90) return 'uncommon'
  return 'rare'
}

async function scavengeGearParts(userId, chanceToFind) {
  console.log('at the end of the hour, this is the chances', chanceToFind)
  if (Math.random() < chanceToFind) {
    const rarity = pickRarity()
    const allParts = await GearParts.findAll({ where: { rarity } })
    const randomPart = allParts[Math.floor(Math.random() * allParts.length)]
    const [userGearPart, created] = await UserGearParts.findOrCreate({
      where: { user_id: userId, parts_id: randomPart.parts_id },
      defaults: { quantity: 0 },
    })
    await userGearPart.increment('quantity', { by: 1 })
    console.log('I found something!')
  } else {
  }
}

// New object to keep track of temporary increments
const tempIncrements = {}

// Function called when a new message is received
function newMessageReceived(userId) {
  tempIncrements[userId] = (tempIncrements[userId] || 0) + 0.01
  // Make sure the temporary increment does not exceed 0.1
  tempIncrements[userId] = Math.min(tempIncrements[userId], 0.1)
}

// Check for messages and increase chance to find every 6 minutes ('*/6 * * * *)
cron.schedule('*/6 * * * *', async () => {
  try {
    const allUsers = await User.findAll({
      attributes: ['user_id'],
    })

    console.log(`Number of total users
    : ${allUsers.length}`)

    // Inside your cron job that fires every 5 seconds...
    for (const user of allUsers) {
      const userId = user.user_id

      // Fetch the current chance from the database
      const dbUser = await User.findOne({ where: { user_id: userId } })
      const currentChanceFromDB = dbUser.currentChance

      // Use the chance from the database if available
      if (currentChanceFromDB !== null) {
        userChanceToFind[userId] = currentChanceFromDB
      } else if (!userChanceToFind[userId]) {
        userChanceToFind[userId] = baseChance
      }

      console.log(
        `Initial chance for User ID ${userId}: ${userChanceToFind[userId]}`
      )

      // Add the temporary increment if there's any, but cap it at 0.01
      const incrementForThisJob = Math.min(
        chanceIncrement,
        tempIncrements[userId] || 0
      )

      userChanceToFind[userId] += incrementForThisJob

      // Cap it at baseChance + maxChanceIncrease
      userChanceToFind[userId] = Math.min(
        userChanceToFind[userId],
        baseChance + maxChanceIncrease
      )

      // Log: Temp increments for this user
      console.log(
        `Temporary increments this job for User ID ${userId}: ${tempIncrements[userId]}`
      )

      // Log: Updated chance for this user
      console.log(
        `Updated chance for User ID ${userId}: ${userChanceToFind[userId]}`
      )

      // Reset the temporary increment for this user
      tempIncrements[userId] = 0

      // Update the chance in the database
      await User.update(
        { currentChance: userChanceToFind[userId] },
        { where: { user_id: userId } }
      )
    }
  } catch (error) {
    console.error('Error in scheduled task:', error)
  }
})

// Search for gear part every hour ('0 * * * *)
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
      await scavengeGearParts(
        user.user_id,
        userChanceToFind[user.user_id] || baseChance
      )
    }

    await User.update(
      { last_counted_message_timestamp: currentTime },
      { where: {} }
    )

    // Reset all chanceToFind to baseChance
    for (const userId in userChanceToFind) {
      userChanceToFind[userId] = baseChance
      await User.update(
        { currentChance: baseChance },
        { where: { user_id: userId } }
      )
    }
  } catch (error) {
    console.error('Error in scheduled task:', error)
  }
})

module.exports = {
  scavengeHelper: async (message) => {
    try {
      const userId = message.author.id

      // Call the new function when a new message is received

      newMessageReceived(userId)

      const user = await User.findOne({ where: { user_id: userId } })
      if (user) {
        const currentTime = new Date()
        if (
          !user.last_counted_message_timestamp ||
          new Date(currentTime - user.last_counted_message_timestamp) >= 360000
        ) {
          await user.save()
        }

        const chanceToFind = userChanceToFind[userId] || baseChance
        await scavengeGearParts(userId, chanceToFind)
      }
    } catch (error) {
      console.error('Error handling incoming message:', error)
    }
  },
}
