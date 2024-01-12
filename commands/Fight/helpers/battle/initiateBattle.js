const {
  Enemy,
} = require('../../../../Models/model');
const { CharacterInstance } = require('../characterFiles/characterInstance');
const battleManager = require('./battleManager');

async function initiateBattle(frontlaneCharacterId, backlaneCharacterId, enemyId, userId) {
  try {
    // Initialize frontlane character
    const frontlaneCharacterStats = await CharacterInstance.initCharacter(
      masterCharacterId, // This needs to be the ID of the master character for the frontlane character
      userId,
      frontlaneCharacterId // This is the specific ID of the frontlane character
    );

    // Initialize backlane character
    const backlaneCharacterStats = await CharacterInstance.initCharacter(
      backlaneMasterCharacterId, // Master character ID for backlane character
      userId,
      backlaneCharacterId // Specific ID of the backlane character
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
