const {
  Character,
  MasterCharacter,
  Enemy,
} = require('../../../../Models/model')

const { CharacterInstance } = require('../characterFiles/characterInstance')
const battleManager = require('./battleManager')

async function initiateBattle(characterId, enemyId) {
  // Fetch the actual character and enemy from the database
  const characterData = await Character.findByPk(characterId)

  const masterCharacterData = await MasterCharacter.findByPk(
    characterData.dataValues.master_character_id
  )

  const enemyData = await Enemy.findByPk(enemyId)

  const newCharacter = await CharacterInstance.initCharacter(
    masterCharacterData.dataValues.master_character_id,
    characterData.dataValues.user_id,
    characterId
  )

  // Create combined stats for the in-memory copy of the character
  const combinedCharacterStats = {
    ...characterData.get(),
    ...masterCharacterData.get(),
    current_health: characterData.effective_health,
    current_damage: characterData.effective_damage,
  }

  // Create in-memory copies
  const CharacterInstanceObject = {
    ...combinedCharacterStats,
    actionQueue: [],
  }
  console.log('Character Instance: ', CharacterInstanceObject)

  const enemyInstance = {
    ...enemyData.get(),
    current_health: enemyData.effective_health,
    current_damage: enemyData.effective_damage,
    actionQueue: [],
  }

  console.log('Enemy Instance: ', enemyInstance)

  const battleKey = `${characterId}-${enemyId}`;  // Create a unique identifier for the battle
  battleManager[battleKey] = {
    characterInstance: CharacterInstanceObject,
    enemyInstance
  };

  return { CharacterInstanceObject, enemyInstance }
}

module.exports = { initiateBattle }
