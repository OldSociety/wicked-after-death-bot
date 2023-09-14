const { Character, MasterCharacter } = require('../../../../Models/model')

class CharacterInstance {
  static async initCharacter(masterCharacterId, userId) {
    // Initialize character based on MasterCharacter
    const masterCharacter = await MasterCharacter.findByPk(masterCharacterId)

    // Check if the master character exists
    if (!masterCharacter) {
      throw new Error('MasterCharacter not found')
    }

    // Character health calculation
    const enhancements_health_bonus = 0
    const enhancements_health_modifier = masterCharacter.dataValues.base_health * enhancements_health_bonus
    const level_health_modifier = 1
    const rank_health_modifier = 1
    const support_health_modifier = 1

    const effective_health = Math.floor(
      (masterCharacter.dataValues.base_health + enhancements_health_modifier) *
        (level_health_modifier * rank_health_modifier * support_health_modifier)
    )

    // Character damage calculation
    const enhancements_damage_bonus = 0
    const enhancements_damage_modifier = masterCharacter.dataValues.base_damage * enhancements_damage_bonus
    const level_damage_modifier = 1
    const rank_damage_modifier = 1
    const support_damage_modifier = 1

    const effective_damage = Math.floor(
      (masterCharacter.dataValues.base_damage + enhancements_damage_modifier) *
        (level_damage_modifier * rank_damage_modifier * support_damage_modifier)
    )

    // Create a new instance of Character and save it
    const newCharacter = await Character.create({
      userId: userId,
      masterCharacterId: masterCharacterId,
      health: effective_health,
      damage: effective_damage,
      chance_to_hit: chance_to_hit,
      crit_chance: crit_chance,
      crit_damage: crit_damage,
    })

    if (!newCharacter) {
      throw new Error('Failed to create new character')
    }

    return newCharacter
  }

  static async updateHealth(characterId, change) {
    // Fetch the character
    const character = await Character.findByPk(characterId)

    if (!character) {
      throw new Error('Character not found')
    }

    // Update the health
    character.health += change
    await character.save()
  }

  // Add more methods related to individual characters
}

module.exports = CharacterInstance
