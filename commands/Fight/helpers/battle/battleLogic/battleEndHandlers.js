const { EmbedBuilder } = require('discord.js')
const { LevelUpSystem } = require('../../characterFiles/levelUpSystem')
const { RewardsHandler } = require('../../characterFiles/rewardsHandler')
const { battleManager, userBattles } = require('../battleManager')

// Function to handle the end of a battle
async function handleBattleEnd(battleKey, interaction) {
  const battle = battleManager[battleKey]
  if (!battle) return

  // Destructure the variables from the battle object
  const { characterInstance, enemyInstance, userId } = battle

  try {
    if (
      characterInstance.current_health <= 0 ||
      enemyInstance.current_health <= 0
    ) {
      if (characterInstance.current_health > 0) {
        // Player won the battle
        await LevelUpSystem.levelUp(
          characterInstance.character_id,
          enemyInstance.enemy_id,
          interaction
        )

        await RewardsHandler.handleRewards(
          userId,
          characterInstance.character_id,
          enemyInstance.enemy_id,
          interaction
        )
      } else {
        // Player lost the battle
        characterInstance.consecutive_kill = 0
        const lossEmbed = new EmbedBuilder()
          .setColor('DarkRed')
          .setDescription(`${enemyInstance.character_name} wins.`)
        await interaction.followUp({ embeds: [lossEmbed] })
      }
    }
  } catch (error) {
    console.error('Error in handleBattleEnd:', error)
  }

  stopBattleCronJobs(battleKey)
}

// Function to stop all cron jobs associated with a battle
function stopBattleCronJobs(battleKey) {
  const battle = battleManager[battleKey]
  if (battle) {
    ;[battle.characterInstance, battle.enemyInstance].forEach((character) => {
      if (character && character.cronTask) {
        character.cronTask.stop()
      }
    })
  }

  delete battleManager[battleKey]
  delete userBattles[battleKey]
}

module.exports = { handleBattleEnd, stopBattleCronJobs }
