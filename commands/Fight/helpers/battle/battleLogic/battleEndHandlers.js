const {EmbedBuilder} = require('discord.js')
const { LevelUpSystem} = require('../../characterFiles/levelUpSystem');
const { battleManager, userBattles } = require('../battleManager')

// const { RewardsHandler } = require('../../characterFiles/rewardsHandler');

// Function to handle the end of a battle
async function handleBattleEnd(battleKey, interaction) {
    const battle = battleManager[battleKey];
    if (!battle) return;

    // Destructure the variables from the battle object
    const { characterInstance, enemyInstance, userId } = battle;

    // Log for debugging
    // console.log('character', characterInstance, 'enemy', enemyInstance, 'user', userId);
    console.log(interaction)

    try {
        if (characterInstance.current_health <= 0 || enemyInstance.current_health <= 0) {
            if (characterInstance.current_health > 0) {
                // Player won the battle
                await LevelUpSystem.levelUp(
                    characterInstance.character_id,
                    enemyInstance.enemy_id,
                    interaction
                );
                // RewardsHandler logic here
            } else {
                // Player lost the battle
                characterInstance.consecutive_kill = 0;
                const lossEmbed = new EmbedBuilder()
                    .setColor('DarkRed')
                    .setDescription(`${enemyInstance.character_name} wins.`);
                await interaction.followUp({ embeds: [lossEmbed] });
            }
        }
    } catch (error) {
        console.error('Error in handleBattleEnd:', error);
    }

    // Clear battle from the manager
    delete battleManager[battleKey];
    delete userBattles[userId];
}

// Function to stop all cron jobs associated with a battle
function stopBattleCronJobs(battleKey) {
    const battle = battleManager[battleKey];
    if (battle) {
        [battle.characterInstance, battle.enemyInstance].forEach((character) => {
            if (character && character.cronTask) {
                character.cronTask.stop();
            }
        });
    }

    delete battleManager[battleKey];
    delete userBattles[battleKey];
}

module.exports = { handleBattleEnd, stopBattleCronJobs };

  
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

  module.exports = { handleBattleEnd, stopBattleCronJobs };