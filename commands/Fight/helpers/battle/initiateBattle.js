const {
  Character,
  MasterCharacter,
  Enemy,
} = require('../../../../Models/model')
const { CharacterInstance } = require('../characterFiles/characterInstance')

async function initiateBattle(
  characterId,
  frontlaneMasterCharacterId,
  enemyId,
  userId
) {
  try {
    // Initialize frontlane character
    await CharacterInstance.initCharacter(
      frontlaneMasterCharacterId,
      userId,
      characterId
    )
    const characterData = await Character.findByPk(characterId)
    const frontlaneMasterCharacterData = await MasterCharacter.findByPk(
      frontlaneMasterCharacterId
    )

    // Fetch the enemy from the database
    const enemyData = await Enemy.findByPk(enemyId)

    // Create combined stats for the in-memory copy of the characters
    const characterInstance = {
      ...characterData.get(),
      ...frontlaneMasterCharacterData.get(),
      current_health: characterData.effective_health,
      current_damage: characterData.effective_damage,
      actionQueue: [],
      buffer_health: 0,
    }

    // Create in-memory copy for the enemy
    const enemyInstance = {
      ...enemyData.get(),
      current_health: enemyData.effective_health,
      current_damage: enemyData.effective_damage,
      actionQueue: [],
      buffer_health: 0,
    }

    return { characterInstance, enemyInstance }
  } catch (error) {
    console.error('Failed to initiate battle: ', error)
    throw new Error('Failed to initiate battle')
  }
}

module.exports = { initiateBattle }
