const { Character, MasterCharacter } = require('../../../../Models/model')

class CharacterInstance {
  static async initCharacter(masterCharacterId, userId) {
    try {
      const masterCharacter = await MasterCharacter.findByPk(masterCharacterId)
      if (!masterCharacter) throw new Error('MasterCharacter not found')

      console.log("1")
      const {
        base_health,
        base_damage,
        chance_to_hit,
        crit_chance,
        crit_damage,
      } = masterCharacter.dataValues
      console.log(2)
      // Character health calculation
      const enhancements_health_bonus = 0
      const enhancements_health_modifier =
        base_health * enhancements_health_bonus
      const level_health_modifier = 1
      const rank_health_modifier = 1
      const support_health_modifier = 1

      const effective_health = Math.floor(
        (base_health + enhancements_health_modifier) *
          (level_health_modifier *
            rank_health_modifier *
            support_health_modifier)
      )
      console.log(3)
      // Character damage calculation
      const enhancements_damage_bonus = 0
      const enhancements_damage_modifier =
        base_damage * enhancements_damage_bonus
      const level_damage_modifier = 1
      const rank_damage_modifier = 1
      const support_damage_modifier = 1
      console.log(4)
      const effective_damage = Math.floor(
        (base_damage + enhancements_damage_modifier) *
          (level_damage_modifier *
            rank_damage_modifier *
            support_damage_modifier)
      )
      console.log(5)
      // Create a new instance of Character and save it
      const newCharacter = await Character.create({
        userId,
        masterCharacterId,
        effective_health,
        effective_damage,
        chance_to_hit,
        crit_chance,
        crit_damage,
      })
      console.log(6)
      if (!newCharacter) throw new Error('Failed to create new character')
      console.log(7)
      return newCharacter
    } catch (error) {
      console.error(error)
      throw new Error('Character initialization failed')
    }
  }

  static async updateHealth(characterId, change) {
    try {
      // Fetch the character instance
      const character = await Character.findByPk(characterId)
      if (!character) throw new Error('Character not found')

      // Update the health
      character.effective_health += change
    } catch (error) {
      console.error(error)
      throw new Error('Failed to update health')
    }
  }

  // Add more methods related to individual characters
}

module.exports = { CharacterInstance }
