const { EmbedBuilder } = require('discord.js')
const {
  User,
  Character,
  MasterCharacter,
  Enemy,
} = require('../../../../Models/model')

class RewardsHandler {
  static async handleRewards(
    userId,
    characterId,
    enemyId,
    interaction
  ) {
    try {
      console.log(userId)
      const user = await User.findByPk(userId)

      // Add constants for the formula
      const e = 2.71828
      const alpha = 0.1

      const character = await Character.findByPk(
        characterId,
        {
          include: [
            {
              model: MasterCharacter,
              as: 'masterCharacter',
            },
          ],
        }
      )

      const enemy = await Enemy.findByPk(enemyId)

      if (!user || !character || !enemy) {
        console.error('User, characters, or enemy not found')
        throw new Error('User, characters, or enemy not found')
      }

      // Calculate XP based on character level and enemy
      const calculateXP = (characterLevel, enemyLevel) => {
        return Math.round(
          enemy.xp_awarded * Math.exp(-alpha * (characterLevel - enemyLevel))
        )
      }

      const XP = calculateXP(character.level, enemy.level)

      let earnedGold = 0
      if (enemy.type !== 'boss' || enemy.type !== 'mini-boss') {
        earnedGold = Math.round(enemy.gold_awarded + 20 * enemy.level)
      }

      // Update user's balance
      user.balance += earnedGold
      await user.save()

      // Create and send the reward embed
      const rewardEmbed = new EmbedBuilder()
        .setTitle(`${enemy.character_name} defeated!`)
        .setColor('DarkGreen')
        .addFields(
          {
            name: `${character.masterCharacter.character_name} `,
            value: '`' + `⏫${XP} XP` + '`' + ` >> ` + '`' + `⏫${character.experience} / ${character.xp_needed} XP`+ '`' , 
            // inline: true,
          },
          { name: 'Reward ', value: '`' + `🪙${earnedGold}` + '`' + ` >> ` + '`' + `🪙${user.balance}` + '`',}
        )

      await interaction.followUp({ embeds: [rewardEmbed], ephemeral: false })
    } catch (error) {
      console.error('Error in handleRewards:', error)
      await interaction.followUp('An error occurred while processing rewards.')
    }
  }
}

module.exports = { test: 'Test Export', RewardsHandler }
