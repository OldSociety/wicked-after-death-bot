const { applyRound } = require('./characterActions') // Import applyRound function

async function SetupPlayerReactions(interaction, characterInstance, enemyInstance) {
    // Reaction collector for player actions
    const filter = (reaction, user) => 1 // Define a filter
    const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

    collector.on('collect', async (reaction, user) => {
        if (characterInstance.current_health > 0) {
            await applyRound(characterInstance, enemyInstance, 'Player', interaction);

            // Set a cooldown for player action
            setTimeout(() => {
                // Allow player to take action again after cooldown
                SetupPlayerReactions(interaction, characterInstance, enemyInstance);
            }, 10000); // 10 seconds cooldown
        }
    });
}

module.exports = {SetupPlayerReactions}
