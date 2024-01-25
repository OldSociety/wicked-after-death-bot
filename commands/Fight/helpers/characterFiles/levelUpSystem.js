const { EmbedBuilder } = require('discord.js')
const {
  Character,
  Enemy,
  MasterCharacter,
} = require('../../../../Models/model')

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
const alpha = 0.1

class LevelUpSystem {
  static async levelUp(
    frontlaneCharacterId,
    backlaneCharacterId,
    enemyId,
    interaction
  ) {
    // Process level up for frontlane character
    await this.processCharacterLevelUp(
      frontlaneCharacterId,
      enemyId,
      interaction
    )

    // Process level up for backlane character
    await this.processCharacterLevelUp(
      backlaneCharacterId,
      enemyId,
      interaction
    )
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
    })

    const enemy = await Enemy.findByPk(enemyId)

    if (!character || !enemy) {
      console.error('Character or enemy not found')
      throw new Error('Character or enemy not found')
    }

    const earnedXP = Math.round(
      enemy.xp_awarded * Math.exp(-alpha * (character.level - enemy.level))
    )

    // let earnedGold = 0
    // if (enemy.type !== 'boss' || enemy.type !== 'mini-boss') {
    //   earnedGold = Math.round(enemy.gold_awarded + 20 * enemy.level)
    // }

    if (earnedXP <= 0) {
      console.warn('No positive experience earned. Skipping update.')
      return
    }

    character.experience += earnedXP

    let levelUpOccurred = false
    let currentLevelData = levelData.find((ld) => ld.level === character.level)
    let newLevelData = levelData.find((ld) => ld.level === character.level + 1)

    // Level up process
    if (character.experience >= currentLevelData.xpToNextLevel) {
      if (newLevelData && character.level < newLevelData.level) {
        levelUpOccurred = true
        character.level = newLevelData.level

        // Update health and damage based on new level
        character.effective_health = Math.floor(
          character.masterCharacter.base_health * newLevelData.healthMultiplier
        )
        character.effective_damage = Math.floor(
          character.masterCharacter.base_damage * newLevelData.damageMultiplier
        )

        // Calculate and update experience for the next level
        character.experience -= currentLevelData.xpToNextLevel
        character.xp_needed = newLevelData.xpToNextLevel
      }
      const levelUpEmbed = new EmbedBuilder()
      .setTitle(
        `${character.masterCharacter.character_name} reaches level ${character.level}!`
      )
      .addFields(
        {
          name: 'Level',
          value: '`' + character.level.toString() + '`',
          inline: true,
        },
        {
          name: 'Experience',
          value:
            '`' +
            character.experience.toString() +
            ' / ' +
            character.xp_needed.toString() +
            '`',
          inline: true,
        },
        {
          name: 'Damage',
          value: '`⚔️' + character.effective_damage.toString() + '`',
          inline: true,
        },
        {
          name: 'Health',
          value: '`🧡' + character.effective_health.toString() + '`',
          inline: true,
        },
        {
          name: 'Crit Chance',
          value: '`🎯' + character.masterCharacter.crit_chance.toString() + '`',
          inline: true,
        },
        {
          name: 'Crit Damage',
          value: '`💥' + character.masterCharacter.crit_damage.toString() + '`',
          inline: true,
        }
      )

    await interaction.followUp({ embeds: [levelUpEmbed], ephemeral: true })
    }
    await character.save()
  }
  catch(e) {
    console.error('Failed to update character:', e)
  }
}

module.exports = LevelUpSystem
