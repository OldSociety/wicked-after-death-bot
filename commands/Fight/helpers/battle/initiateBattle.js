const {
  Character,
  MasterCharacter,
  Enemy,
} = require('../../../../Models/model')

const { CharacterInstance } = require('../characterFiles/characterInstance')

async function initiateBattle(characterId, enemyId) {
  // Fetch the actual character and enemy from the database
  const characterData = await Character.findByPk(characterId)

  const masterCharacterData = await MasterCharacter.findByPk(
    characterData.dataValues.master_character_id
  )

  const enemyData = await Enemy.findByPk(enemyId)

  console.log('master_character_id:', characterData.dataValues.master_character_id);

  const newCharacter = await Character.create({
    user_id: characterData.dataValues.user_id,
    master_character_id: characterData.dataValues.master_character_id,
    // other fields
  });
  
  console.log(2, newCharacter.master_character_id)
  await CharacterInstance.initCharacter(
    newCharacter.master_character_id,
    newCharacter.user_id
  )

  // Create combined stats for the in-memory copy of the character
  const combinedCharacterStats = {
    ...characterData.get(),
    ...masterCharacterData.get(),
    currentHealth: characterData.effective_health,
    currentDamage: characterData.effective_damage,
  }

  await CharacterInstance.updateHealth(characterId, some_health_change_value)

  // Create in-memory copies
  const CharacterInstanceObject = {
    ...combinedCharacterStats,
    actionQueue: [],
  }

  const enemyInstance = {
    ...enemyData.get(),
    currentHealth: enemyData.base_health,
    currentDamage: enemyData.base_damage,
  }

  // Initialize action queues if needed
  CharacterInstance.actionQueue = []
  enemyInstance.actionQueue = []

  return { CharacterInstanceObject, enemyInstance }
}

module.exports = { initiateBattle }
