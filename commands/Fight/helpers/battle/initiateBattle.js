const {
  Enemy,
} = require('../../../../Models/model');
const { CharacterInstance } = require('../characterFiles/characterInstance');
const battleManager = require('./battleManager');

async function initiateBattle(frontlineCharacterId, backlineCharacterId, enemyId, userId) {
  try {
    // Initialize frontline character
    const frontlineCharacterStats = await CharacterInstance.initCharacter(
      frontlineCharacterId,
      userId
    );

    // Initialize backline character
    const backlineCharacterStats = await CharacterInstance.initCharacter(
      backlineCharacterId,
      userId
    );

    // Fetch the enemy from the database
    const enemyData = await Enemy.findByPk(enemyId);

    // Create in-memory instances
    const frontlineCharacterInstance = {
      ...frontlineCharacterStats,
      actionQueue: [],
      buffer_health: 0
    };

    const backlineCharacterInstance = {
      ...backlineCharacterStats,
      actionQueue: [],
      buffer_health: 0
    };

    const enemyInstance = {
      ...enemyData.get(),
      current_health: enemyData.effective_health,
      current_damage: enemyData.effective_damage,
      actionQueue: [],
      buffer_health: 0
    };

    // Create a unique identifier for the battle
    const battleKey = `${frontlineCharacterId}-${backlineCharacterId}-${enemyId}`;
    battleManager[battleKey] = {
      frontlineCharacterInstance,
      backlineCharacterInstance,
      enemyInstance,
    };

    return { frontlineCharacterInstance, backlineCharacterInstance, enemyInstance };
  } catch (error) {
    console.error('Failed to initiate battle: ', error);
    throw new Error('Failed to initiate battle');
  }
}

module.exports = { initiateBattle };
