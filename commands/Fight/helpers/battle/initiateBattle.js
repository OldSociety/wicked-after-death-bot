const {
  Enemy,
} = require('../../../../Models/model');
const { CharacterInstance } = require('../characterFiles/characterInstance');
const battleManager = require('./battleManager');

async function initiateBattle(frontlaneCharacterId, backlaneCharacterId, enemyId, userId) {
  try {
    // Initialize frontlane character
    const frontlaneCharacterStats = await CharacterInstance.initCharacter(
      frontlaneCharacterId,
      userId
    );

    // Initialize backlane character
    const backlaneCharacterStats = await CharacterInstance.initCharacter(
      backlaneCharacterId,
      userId
    );

    // Fetch the enemy from the database
    const enemyData = await Enemy.findByPk(enemyId);

    // Create in-memory instances
    const frontlaneCharacterInstance = {
      ...frontlaneCharacterStats,
      actionQueue: [],
      buffer_health: 0
    };

    const backlaneCharacterInstance = {
      ...backlaneCharacterStats,
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
    const battleKey = `${frontlaneCharacterId}-${backlaneCharacterId}-${enemyId}`;
    battleManager[battleKey] = {
      frontlaneCharacterInstance,
      backlaneCharacterInstance,
      enemyInstance,
    };

    return { frontlaneCharacterInstance, backlaneCharacterInstance, enemyInstance };
  } catch (error) {
    console.error('Failed to initiate battle: ', error);
    throw new Error('Failed to initiate battle');
  }
}

module.exports = { initiateBattle };
