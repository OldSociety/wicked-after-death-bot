const cron = require('node-cron');
const battleManager = require('./battleManager');

function applyDamage(attacker, defender) {
  const rand = Math.random() * 100;
  if (rand < attacker.chance_to_hit) {
    defender.base_health -= attacker.effective_damage;
    console.log(`${attacker.name} hits ${defender.name} for ${attacker.effective_damage} damage.`);
  } else {
    console.log(`${attacker.name} misses.`);
  }
}

const setupBattleLogic = () => {
  cron.schedule(' 0 * * * *', () => {
    console.log('Current battles:', JSON.stringify(battleManager));

    Object.keys(battleManager).forEach((battleKey) => {
      const { characterInstance, enemyInstance } = battleManager[battleKey];
      // Perform hit chance checks and health deductions here
      console.log("Character Health: ", characterInstance.effective_health);
      console.log("Enemy Health: ", enemyInstance.base_health);
      applyDamage(characterInstance, enemyInstance);
      applyDamage(enemyInstance, characterInstance);

      // If either character or enemy is defeated, remove from battleManager
      if (
        characterInstance.effective_health <= 0 ||
        enemyInstance.base_health <= 0
      ) {
        console.log('Battle ends.');
        delete battleManager[battleKey];
        // Perform additional actions like logging, notifications, etc.
      }
    });
  });
};

// Run the setup function once to initiate the cron job
setupBattleLogic();

module.exports = { setupBattleLogic };
