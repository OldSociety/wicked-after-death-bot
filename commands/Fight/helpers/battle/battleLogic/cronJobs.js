const cron = require('node-cron')
const { calculateAttackSpeed } = require('./battleUtils');
const { handleCharacterAction } = require('./characterActions');

let cronTask = null

// Function to set up a cron job for a character
const setupCharacterCron = (
    characterInstance,
    role,
    interaction,
    battleKey
  ) => {
    const attackSpeed = calculateAttackSpeed(characterInstance)
    const cronTask = cron.schedule(`*/${attackSpeed} * * * * *`, async () => {
      await handleCharacterAction(characterInstance, role, interaction, battleKey)
    })
    characterInstance.cronTask = cronTask // Assign the cron task to the character instance
  }

  module.exports = { setupCharacterCron };