const { Character } = require('../../../../Models/model')

function generateLevelData(maxLevel) {
  let levelData = []
  let cumulativeXP = 0
  let xpToNextLevel = 1000
  let damageMultiplier = 1.0
  let healthMultiplier = 1.0

  for (let level = 1; level <= maxLevel; level++) {
    levelData.push({
      level,
      cumulativeXP,
      xpToNextLevel,
      damageMultiplier,
      healthMultiplier,
    })

    cumulativeXP += xpToNextLevel

    if (level < 10) {
      xpToNextLevel += 1000
      damageMultiplier += 0.2
      healthMultiplier += 0.2
    } else if (level >= 10 && level < 30) {
      xpToNextLevel += 2000
      damageMultiplier += 0.1
      healthMultiplier += 0.2
    } else if (level >= 30) {
      xpToNextLevel = 100000
      damageMultiplier += 0.05
      healthMultiplier += 0.2
    }
  }

  return levelData
}

const maxLevel = 40
const levelData = generateLevelData(maxLevel)

class LevelUpSystem {
  static async levelUp(characterId, earnedXP) {
    const character = await Character.findByPk(characterId);
    if (!character) {
      console.error('Character not found');
      throw new Error('Character not found');
    }

    
    if (earnedXP <= 0) {
      console.warn('No positive experience earned. Skipping update.');
      return;
    }

    console.log(`Initial XP: ${character.experience}`);
    character.experience += earnedXP;
    console.log(`Updated XP: ${character.experience}`);

    let newLevelData = null;
    for (const ld of levelData) {
      if (character.experience >= ld.cumulativeXP) {
        newLevelData = ld;
        console.log(4, newLevelData)
      } else {
        console.log(5)
        break; // Exit loop once you find the level range where the character's experience lies
      }
    }

    try {
      if (newLevelData && newLevelData.level > character.level) {
        character.level = newLevelData.level;
        character.xp_needed = newLevelData.xpToNextLevel;
        character.effective_health = Math.floor(character.effective_health * newLevelData.healthMultiplier);
        character.effective_damage = Math.floor(character.effective_damage * newLevelData.damageMultiplier);
      }
      
      await character.save();
      console.log('Updated experience:', character.experience);
      
    } catch (e) {
      console.error('Failed to update character:', e);
    }
  }
}

// ... (rest of the code)



module.exports = LevelUpSystem
