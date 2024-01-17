const { EmbedBuilder } = require('discord.js')
const { Character, Enemy, MasterCharacter } = require('../../../../Models/model')

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

// Add constants for the formula
const e = 2.71828
const alpha = 0.1 // You can set alpha to whatever decay constant you desire

class LevelUpSystem {
  static async levelUp(frontlaneCharacterId, backlaneCharacterId, enemyId, interaction) {
    // Process level up for frontlane character
    await this.processCharacterLevelUp(frontlaneCharacterId, enemyId, interaction);

    // Process level up for backlane character
    await this.processCharacterLevelUp(backlaneCharacterId, enemyId, interaction);
  }

  static async processCharacterLevelUp(characterId, enemyId, interaction) {
    const character = await Character.findByPk(characterId, {
      include: [
        {
          model: MasterCharacter,
          as: 'masterCharacter',
          attributes: { exclude: ['master_character_id'] },
        },
      ],
    });

    const enemy = await Enemy.findByPk(enemyId);

    if (!character || !enemy) {
      console.error('Character or enemy not found');
      throw new Error('Character or enemy not found');
    }

    const earnedXP = Math.round(
      enemy.xp_awarded * Math.exp(-alpha * (character.level - enemy.level))
    );

    let earnedGold = 0;
    if (enemy.type !== 'boss' || enemy.type !== 'mini-boss') {
      earnedGold = Math.round(enemy.gold_awarded + (20 * enemy.level));
    }

    if (earnedXP <= 0) {
      console.warn('No positive experience earned. Skipping update.');
      return;
    }

    character.experience += Math.round(earnedXP);

    let newLevelData = null;
    for (const ld of levelData) {
      if (character.experience >= ld.cumulativeXP) {
        newLevelData = ld;
      } else {
        break;
      }
    }

    try {
      if (newLevelData && newLevelData.level > character.level) {
        character.level = newLevelData.level;
        character.xp_needed = newLevelData.xpToNextLevel;
        character.effective_health = Math.floor(
          character.effective_health * newLevelData.healthMultiplier
        );
        character.effective_damage = Math.floor(
          character.effective_damage * newLevelData.damageMultiplier
        );
      }

      await character.save();

      const critEmbed = new EmbedBuilder()
        .setTitle(`${character.masterCharacter.character_name} wins.`)
        .addFields({
          name: `Rewards`,
          value: `Earned ` + '`' + `⏫${earnedXP}` + '`' + ` XP and found ` + '`' + `🪙${earnedGold}` + '`' + ` gold.`,
        });

      await interaction.followUp({ embeds: [critEmbed]});
    } catch (e) {
      console.error('Failed to update character:', e);
    }
  }
}


module.exports = LevelUpSystem
