const cron = require('node-cron');
const battleManager = require('./battleManager');

const setupBattleLogic = () => {
  cron.schedule('* * * * *', () => {
    Object.keys(battleManager).forEach((battleKey) => {
      const { characterInstance, enemyInstance } = battleManager[battleKey];
      // Perform hit chance checks and health deductions here
      // ...
  
      // If either character or enemy is defeated, remove from battleManager
      if (characterInstance.effective_health <= 0 || enemyInstance.base_health <= 0) {
        delete battleManager[battleKey];
        // Perform additional actions like logging, notifications, etc.
      }
    });
  });
};

// Run the setup function once to initiate the cron job
setupBattleLogic();

module.exports = { setupBattleLogic };