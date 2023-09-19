const {
  Character,
  MasterCharacter,
  Enemy,
} = require('../../../../Models/model')

const { CharacterInstance } = require('../characterFiles/characterInstance')
const battleManager = require('./battleManager')

async function initiateBattle(characterId, enemyId) {
  try {
    // Initialize character to update effective_health and effective_damage
    await CharacterInstance.initialize(characterId)

    // Fetch the updated character and enemy from the database
    const characterData = await Character.findByPk(characterId)

    const masterCharacterData = await MasterCharacter.findByPk(
      characterData.dataValues.master_character_id
    )

    const enemyData = await Enemy.findByPk(enemyId)

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

    const enemyInstance = {
      ...enemyData.get(),
      current_health: enemyData.effective_health,
      current_damage: enemyData.effective_damage,
      actionQueue: [],
    }

    CharacterInstanceObject.buffer_health = 0
    enemyInstance.buffer_health = 0


    console.log("Character:", CharacterInstanceObject)
    // Create a unique identifier for the battle
    const battleKey = `${characterId}-${enemyId}`
    battleManager[battleKey] = {
      characterInstance: CharacterInstanceObject,
      enemyInstance,
    }

    return { characterInstance: CharacterInstanceObject, enemyInstance }
  } catch (error) {
    console.error('Failed to initiate battle: ', error)
    throw new Error('Failed to initiate battle')
  }
}

module.exports = { initiateBattle }
