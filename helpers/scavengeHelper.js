const cron = require('node-cron')
const { Op } = require('sequelize')
const { EmbedBuilder } = require('discord.js')
const { User, GearParts, UserGearParts } = require('../Models/model')
const sequelize = require('../config/sequelize')

const baseChance = 0.01
const chanceIncrement = 0.01
const userChanceToFind = {}
const userIncrementFlags = {} // Store flags to track increments

// Function to update currentChance
async function updateCurrentChance(user, userId, chanceIncrement) {
  // Increment the user's temporary increment, but limit it to 0.15
  const incrementedChance = parseFloat(
    (user.currentChance + chanceIncrement).toFixed(2)
  )

  // Apply the limit of 0.15
  const limitedChance = Math.min(incrementedChance, 0.15).toFixed(2)

  // Update the user's currentChance in the database with the limited value
  await User.update(
    { currentChance: limitedChance },
    { where: { user_id: userId } }
  )

  return limitedChance
}

// Function to manage the timer
async function manageTimer(user, userId, baseChance) {
  const now = new Date() // Current date and time

  if (!user.cooldownTime || user.cooldownTime <= now.getTime()) {
    const cooldownDuration = 3600000 // One hour in milliseconds

    // Check if the user was on cooldown before, indicating the cooldown has ended
    const wasOnCooldown = user.cooldownTime > now.getTime()

    // If the user was on cooldown, reset currentChance to baseChance
    if (wasOnCooldown) {
      user.currentChance = baseChance
    }

    const cooldownEndTime = now.getTime() + cooldownDuration
    user.cooldownTime = cooldownEndTime

    // Save the updated user object with the new cooldown time and currentChance
    await user.save()
  }

  if (user.cooldownTime > now.getTime()) {
    const timeRemainingMilliseconds = user.cooldownTime - now.getTime()
    const timeRemainingSeconds = timeRemainingMilliseconds / 1000 // Convert to seconds
    console.log(
      'On cooldown. Remaining time:',
      timeRemainingSeconds.toFixed(0),
      'seconds'
    )
  } else {
    console.log('Timer not set')
  }
}

// Main function
module.exports = {
  scavengeHelper: async (message) => {
    try {
      if (!message || !message.author) {
        console.error('Invalid message or message author.')
        return
      }

      const userId = message.author.id
      const userName = message.author.username

      console.log(userName, ' sent a message')

      const user = await User.findByPk(userId)

      console.log(15, user)

      if (!user) {
        console.error('User not found in the database.')
        return
      }

      // Fetch the user's currentChance from the database
      const currentChance = user.currentChance || 0
      console.log(1, currentChance)

      // Manage the timer
      await manageTimer(user, userId, baseChance)

      // Update currentChance and log the new value
      const updatedChance = await updateCurrentChance(
        user,
        userId,
        chanceIncrement
      )
      console.log('Updated currentChance:', updatedChance)
    } catch (error) {
      console.error('Error handling incoming message:', error)
    }
  },
  getChanceToFind: (userId) => {
    return userChanceToFind[userId] || baseChance
  },
}
