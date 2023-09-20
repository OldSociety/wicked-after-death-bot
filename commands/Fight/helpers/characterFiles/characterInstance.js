const { Character, MasterCharacter } = require('../../../../Models/model')

class CharacterInstance {
  static async initCharacter(masterCharacterId, userId, characterId) {
    try {
      // Fetch the existing character
      const character = await Character.findByPk(characterId)

      if (!character) throw new Error('Character not found')

      if (!character.initialized) {
        const masterCharacter = await MasterCharacter.findByPk(
          masterCharacterId
        )
        if (!masterCharacter) throw new Error('MasterCharacter not found')

        const {
          base_health,
          base_damage,
          chance_to_hit,
          crit_chance,
          crit_damage,
        } = masterCharacter.dataValues

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

        // Character damage calculation
        const enhancements_damage_bonus = 0
        const enhancements_damage_modifier =
          base_damage * enhancements_damage_bonus
        const level_damage_modifier = 1
        const rank_damage_modifier = 1
        const support_damage_modifier = 1

        const effective_damage = Math.floor(
          (base_damage + enhancements_damage_modifier) *
            (level_damage_modifier *
              rank_damage_modifier *
              support_damage_modifier)
        )

        // Update and save the character attributes only once
        await character.update({
          effective_health,
          effective_damage,
          chance_to_hit,
          crit_chance,
          crit_damage,
          initialized: true, // Set initialized to true
        })

        return {
          effective_health,
          effective_damage,
          chance_to_hit,
          crit_chance,
          crit_damage,
        }
      } else {
        // Character is already initialized, return current stats
        return {
          effective_health: character.effective_health,
          effective_damage: character.effective_damage,
          chance_to_hit: character.chance_to_hit,
          crit_chance: character.crit_chance,
          crit_damage: character.crit_damage,
        }
      }
    } catch (error) {
      console.error(error)
      throw new Error('Character initialization failed')
    }
  }
}

module.exports = { CharacterInstance }
