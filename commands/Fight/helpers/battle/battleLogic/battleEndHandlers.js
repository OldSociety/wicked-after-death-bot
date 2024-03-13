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

 await stopBattleCronJobs(battleKey, userId)
}

// Function to stop all cron jobs associated with a battle
async function stopBattleCronJobs(battleKey, userId) {
  const battle = battleManager[battleKey];
  if (battle) {
    await Promise.all([battle.characterInstance, battle.enemyInstance].map(character => {
      if (character && character.cronTask) {
        // Assuming `character.cronTask.stop()` returns a Promise
        return character.cronTask.stop();
      } else {
        return Promise.resolve(); // No operation needed, immediately resolve
      }
    }));
  }
  // console.log(`Clearing battle for user ${JSON.stringify(userBattles)}. Battle key: ${battleKey}`);
  delete battleManager[battleKey];
  delete userBattles[userId];
  // console.log("battleManager after delete:", JSON.stringify(battleManager)); // Should be empty
  // console.log("userBattles after delete:", JSON.stringify(userBattles)); // Should also be empty
}

module.exports = { handleBattleEnd, stopBattleCronJobs }
