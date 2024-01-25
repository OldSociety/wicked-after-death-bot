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
    frontlaneCharacterId,
    backlaneCharacterId,
    enemyId,
    interaction
  ) {
    try {
      const user = await User.findByPk(userId)

      // Add constants for the formula
      const e = 2.71828
      const alpha = 0.1

      const frontlaneCharacter = await Character.findByPk(
        frontlaneCharacterId,
        {
          include: [
            {
              model: MasterCharacter,
              as: 'masterCharacter',
            },
          ],
        }
      )
      const backlaneCharacter = await Character.findByPk(backlaneCharacterId, {
        include: [
          {
            model: MasterCharacter,
            as: 'masterCharacter',
          },
        ],
      })

      const enemy = await Enemy.findByPk(enemyId)
      console.log(
        'Frontlane Character:',
        frontlaneCharacter.masterCharacter.character_name
      )

      if (!user || !frontlaneCharacter || !backlaneCharacter || !enemy) {
        console.error('User, characters, or enemy not found')
        throw new Error('User, characters, or enemy not found')
      }

      // Calculate XP based on character level and enemy
      const calculateXP = (characterLevel, enemyLevel) => {
        return Math.round(
          enemy.xp_awarded * Math.exp(-alpha * (characterLevel - enemyLevel))
        )
      }

      const frontlaneXP = calculateXP(frontlaneCharacter.level, enemy.level)
      const backlaneXP = calculateXP(backlaneCharacter.level, enemy.level)
      console.log('frontlane: ', frontlaneXP, ' backlane: ', backlaneXP)

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
        .addFields(
          {
            name: `${frontlaneCharacter.masterCharacter.character_name} `,
            value: '`' + `⏫${frontlaneXP} XP` + '`' + ` >> ` + '`' + `⏫${frontlaneCharacter.experience} / ${frontlaneCharacter.xp_needed} XP`+ '`' , 
            inline: true,
          },
          {
            name: `${backlaneCharacter.masterCharacter.character_name} `,
            value: '`' + `⏫${backlaneXP} XP` + '`' +  ` >> ` + '`' + `⏫${backlaneCharacter.experience} / ${backlaneCharacter.xp_needed} XP`+ '`', 
            inline: true,
          },
          { name: 'Reward ', value: '`' + `🪙${earnedGold}` + '`' + ` >> ` + '`' + `🪙${user.balance}` + '`',}
        )

      await interaction.followUp({ embeds: [rewardEmbed], ephemeral: true })
    } catch (error) {
      console.error('Error in handleRewards:', error)
      await interaction.followUp('An error occurred while processing rewards.')
    }
  }
}

module.exports = RewardsHandler
