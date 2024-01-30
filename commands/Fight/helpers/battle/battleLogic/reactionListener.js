// Function to handle player reactions for actions
async function setupPlayerActionReactions(interaction, playerInstance, enemyInstance) {
    // Send a message with reactions for player actions
    const message = await interaction.followUp({ content: 'Choose your action:', components: red });

    // Reaction collector for player actions
    const filter = (reaction, user) => 1
    const collector = message.createReactionCollector({ filter, time: 60000 });

    collector.on('collect', async (reaction, user) => {
        // Player chooses an action
        if (playerInstance.current_health > 0) {
            // Execute player action based on reaction
            // ...
            await applyRound(playerInstance, enemyInstance, 'Player', interaction);

            // Set a cooldown for player action
            setTimeout(() => {
                // Allow player to take action again after cooldown
                setupPlayerActionReactions(interaction, playerInstance, enemyInstance);
            }, 10000); // 10 seconds cooldown
        }
    });
}