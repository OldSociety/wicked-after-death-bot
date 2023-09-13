const cron = require('node-cron')
const { Op } = require('sequelize')
const { User, GearParts, UserGearParts } = require('../Models/model')
const sequelize = require('../Utils/sequelize')

const baseChance = 0.05
const maxChanceIncrease = 0.1
const chanceIncrement = 0.01
const userChanceToFind = {}
const userIncrementFlags = {} // Store flags to track increments

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
  }
}

// Check for messages and increase chance to find every 6 minutes ('*/6 * * * *')
cron.schedule('*/6 * * * *', async () => {
  try {
    for (const userId of Object.keys(userIncrementFlags)) {
      if (userIncrementFlags[userId]) {
        // Only proceed if flag is true
        // Check if flag is set for user
        const dbUser = await User.findOne({ where: { user_id: userId } })
        const currentChanceFromDB = dbUser ? dbUser.currentChance : null

        if (currentChanceFromDB !== null) {
          userChanceToFind[userId] = currentChanceFromDB
        } else if (!userChanceToFind[userId]) {
          userChanceToFind[userId] = baseChance
        }

        console.log(
          `Initial chance for User ID ${userId}: ${userChanceToFind[userId]}`
        )

        // Increment the chance by 0.01, and then round it to two decimal places
        userChanceToFind[userId] = parseFloat(
          (userChanceToFind[userId] + chanceIncrement).toFixed(2)
        )

        // Log: Updated chance for this user
        console.log(
          `Updated chance for User ID ${userId}: ${userChanceToFind[userId]}`
        )

        // Update the chance in the database
        await User.update(
          { currentChance: userChanceToFind[userId] },
          { where: { user_id: userId } }
        )
      } // End of if block
    }

    console.log('Before reset:', JSON.stringify(userIncrementFlags))

    Object.keys(userIncrementFlags).forEach((userId) => {
      userIncrementFlags[userId] = false
    })

    console.log('After reset:', JSON.stringify(userIncrementFlags))
  } catch (error) {
    console.error('Error in scheduled task:', error)
  }
})

// Search for gear part every hour ('0 * * * *)
cron.schedule('0 * * * *', async () => {
  try {
    const currentTime = new Date()
    const uniqueUserIds = await UserGearParts.findAll({
      attributes: [[sequelize.literal('CAST(`user_id` AS CHAR)'), 'user_id']],
      group: ['user_id'],
    })

    for (const uniqueUser of uniqueUserIds) {
      const userId = String(uniqueUser.dataValues.user_id)
      console.log('Querying for user ID:', userId)

      const user = await User.findOne({
        where: { user_id: userId },
        attributes: ['user_id'],
      })

      if (user) {
        await scavengeGearParts(
          user.user_id,
          userChanceToFind[userId] || baseChance
        )
        userChanceToFind[userId] = baseChance // Reset to baseChance
        console.log('chance successfully reset to ', userChanceToFind[userId])
        // Update the chance in the database
        await User.update(
          { currentChance: userChanceToFind[userId] },
          { where: { user_id: userId } }
        )
      } else {
        console.log(`No user found with ID ${userId}`)
      }
    }
  } catch (error) {
    console.error('Error in cron job:', error)
  }
})

module.exports = {
  scavengeHelper: async (message) => {
    try {
      const userId = message.author.id
      const userName = message.author.username

      console.log(userName, ' sent a message')
      // Call the new function when a new message is received
      // newMessageReceived(userId)

      // Check if the increment flag is set for this user in this job
      if (!userIncrementFlags[userId]) {
        // Increment the user's temporary increment
        userChanceToFind[userId] =
          (userChanceToFind[userId] || 0) + chanceIncrement

        // Set the increment flag to prevent further increments in this job
        userIncrementFlags[userId] = true
      }
    } catch (error) {
      console.error('Error handling incoming message:', error)
    }
  },
}
