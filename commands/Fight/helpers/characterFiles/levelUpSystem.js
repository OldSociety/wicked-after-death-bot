// levelUpSystem.js

const { Character } = require('../../../Models/models');

class LevelUpSystem {
  static async levelUp(characterId) {
    const character = await Character.findByPk(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    character.dataValues.level += 1;

    // More complex logic here...

    await character.save();
  }
}

module.exports = LevelUpSystem;
