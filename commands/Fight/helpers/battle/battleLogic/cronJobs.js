const cron = require('node-cron')
const { calculateAttackSpeed } = require('./battleUtils')
const { handleCharacterAction } = require('./characterActions')

// Function to set up a cron job for a character
const setupCharacterCron = (
  enemyInstance,
  characterInstance,
  role,
  interaction,
  battleKey
) => {
  const attackSpeed = calculateAttackSpeed(characterInstance)
  const userName = interaction.user.username
  const channel = interaction.channel

  if (role === 'enemy') {
    // Enemy acts automatically, start cron job immediately
    characterInstance.cronTask = cron.schedule(`*/10 * * * * *`, async () => {
      console.log('FIGHT: ', enemyInstance.character_name, characterInstance.character_name, 'role: ', role, 'username: ', userName)
      await applyRound(enemyInstance, characterInstance, role, userName, channel)
    })
  } else if (role === 'character') {
    // Player acts manually, set up cron job but do not start immediately
    characterInstance.cronTask = cron.schedule(
      `*/${attackSpeed} * * * * *`,
      async () => {
        await handleCharacterAction(
          characterInstance,
          role,
          interaction,
          battleKey
        )
      },
      { scheduled: false }
    )
  }
}

module.exports = { setupCharacterCron }
