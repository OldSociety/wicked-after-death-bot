const cron = require('node-cron')
const { calculateAttackSpeed } = require('./battleUtils');
const { handleCharacterAction } = require('./characterActions');

// Function to set up a cron job for a character
const setupCharacterCron = (
  characterInstance,
  role,
  interaction,
  battleKey
) => {
  const attackSpeed = calculateAttackSpeed(characterInstance);
  if (role === 'enemy') {
    // Enemy acts automatically, start cron job immediately
    characterInstance.cronTask = cron.schedule(`*/10 * * * * *`, async () => {
      await handleCharacterAction(characterInstance, role, interaction, battleKey);
    });
  } else if (role === 'character') {
    // Player acts manually, set up cron job but do not start immediately
    characterInstance.cronTask = cron.schedule(`*/${attackSpeed} * * * * *`, async () => {
      await handleCharacterAction(characterInstance, role, interaction, battleKey);
    }, { scheduled: false });
  }
};

  module.exports = { setupCharacterCron };