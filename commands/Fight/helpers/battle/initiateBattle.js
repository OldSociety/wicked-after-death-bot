const {
  Character,
  MasterCharacter,
  Enemy,
} = require('../../../../Models/model')
const { CharacterInstance } = require('../characterFiles/characterInstance');
const battleManager = require('./battleManager');

async function initiateBattle(frontlaneCharacterId, frontlaneMasterCharacterId, backlaneCharacterId, backlaneMasterCharacterId, enemyId, userId) {
  try {
    // Initialize frontlane character
    await CharacterInstance.initCharacter(
      frontlaneMasterCharacterId, userId, frontlaneCharacterId
    );
    const frontlaneCharacterData = await Character.findByPk(frontlaneCharacterId);
    const frontlaneMasterCharacterData = await MasterCharacter.findByPk(
      frontlaneMasterCharacterId
    );

    // Initialize backlane character
    await CharacterInstance.initCharacter(
      backlaneMasterCharacterId, userId, backlaneCharacterId
    );
    const backlaneCharacterData = await Character.findByPk(backlaneCharacterId);
    const backlaneMasterCharacterData = await MasterCharacter.findByPk(
      backlaneMasterCharacterId
    );

    // Fetch the enemy from the database
    const enemyData = await Enemy.findByPk(enemyId);

    // Create combined stats for the in-memory copy of the characters
    const frontlaneCharacterInstance = {
      ...frontlaneCharacterData.get(),
      ...frontlaneMasterCharacterData.get(),
      current_health: frontlaneCharacterData.effective_health,
      current_damage: frontlaneCharacterData.effective_damage,
      actionQueue: [],
      buffer_health: 0
    };

    const backlaneCharacterInstance = {
      ...backlaneCharacterData.get(),
      ...backlaneMasterCharacterData.get(),
      current_health: backlaneCharacterData.effective_health,
      current_damage: backlaneCharacterData.effective_damage,
      actionQueue: [],
      buffer_health: 0
    };

    // Create in-memory copy for the enemy
    const enemyInstance = {
      ...enemyData.get(),
      current_health: enemyData.effective_health,
      current_damage: enemyData.effective_damage,
      actionQueue: [],
      buffer_health: 0
    };

    return { frontlaneCharacterInstance, backlaneCharacterInstance, enemyInstance };
  } catch (error) {
    console.error('Failed to initiate battle: ', error);
    throw new Error('Failed to initiate battle');
  }
}

module.exports = { initiateBattle };
