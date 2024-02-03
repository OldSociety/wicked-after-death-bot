const { Character } = require('../../../Models/models')

class GearSystem {
  static async levelUp(characterId) {
    const character = await Character.findByPk(characterId)
    if (!character) {
      throw new Error('Character not found')
    }

    character.dataValues.level += 1

    await character.save()
  }
}

module.exports = GearSystem
