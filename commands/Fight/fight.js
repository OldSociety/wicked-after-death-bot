const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ChannelType,
} = require('discord.js')
const { retrieveCharacters } = require('./helpers/characterRetrieval')
const { selectEnemy } = require('./helpers/enemySelection')
const { initiateBattle } = require('./helpers/battle/initiateBattle')
const { battleLogic } = require('./helpers/battle/battleLogic')
const { battleManager, userBattles } = require('./helpers/battle/battleManager')
const {
  characterInstance,
} = require('./helpers/characterFiles/characterInstance')
const { setupBattleLogic } = require('./helpers/battle/battleLogic')

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('fight')
    .setDescription('Engage in combat'),

  async execute(interaction) {
    try {
      const userId = interaction.user.id
      const userName = interaction.user.username

      const userCharacters = await retrieveCharacters(userId)
      if (!userCharacters.length) {
        await interaction.reply('You have no characters to select.')
        return
      }

      const options = userCharacters.map((char) => {
        let rarityColor

        // Decide the font color based on the rarity
        switch (userCharacters.rarity) {
          case 'folk hero':
            rarityColor = '🟩'
            break
          case 'legend':
            rarityColor = '🟦'
            break
          case 'unique':
            rarityColor = '🟪'
            break
          default:
            rarityColor = '⬜'
        }

        const {
          dataValues: { character_id },
          masterCharacter: {
            dataValues: { character_name, base_health, base_damage },
          },
        } = char

        return new StringSelectMenuOptionBuilder()
          .setLabel(`${rarityColor} ${character_name}`)
          .setValue(character_id.toString())
      })

      if (userBattles[userId]) {
        await interaction.reply('You are already in an ongoing battle.')
        return
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('characterSelect')
        .setPlaceholder('Select your frontline character...')
        .addOptions(options)

      const actionRow = new ActionRowBuilder().addComponents(selectMenu)

      const characterEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Character Selection')

      await interaction.reply({
        embeds: [characterEmbed],
        components: [actionRow],
        ephemeral: true,
        content: 'Select your frontline character',
      })

      const filter = (i) => {
        i.deferUpdate()
        return (
          i.customId === 'characterSelect' ||
          i.customId === 'backlineCharacterSelect'
        )
      }

      // Collector for character selection
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 30000,
      })

      let frontlineCharacter, backlineCharacter;
collector.on('collect', async (i) => {
  if (userBattles[userId]) {
    await interaction.followUp('You are already in an ongoing battle.');
    return;
  }

  if (!frontlineCharacter && i.customId === 'characterSelect') {
    // Handle frontline character selection
    const selectedFrontlineCharacterId = i.values[0]; // Correctly capturing the selected ID
    frontlineCharacter = userCharacters.find(
      (char) => char.dataValues.character_id.toString() === selectedFrontlineCharacterId
    );

    if (frontlineCharacter) {
      // Log the name of the selected frontline character
      console.log("Frontline character selected:", frontlineCharacter.masterCharacter.character_name);
  } else {
      console.log("Frontline character not found for ID:", selectedFrontlineCharacterId);
  }
    
    const backlineSelectMenu = new StringSelectMenuBuilder()
      .setCustomId('backlineCharacterSelect')
      .setPlaceholder('Select your backline character...')
      .addOptions(options);

    await interaction.editReply({
      content: 'Select your backline character',
      components: [new ActionRowBuilder().addComponents(backlineSelectMenu)],
    });
  } else if (!backlineCharacter && i.customId === 'backlineCharacterSelect') {
    // Handle backline character selection
    backlineCharacter = userCharacters.find(
      (char) => char.dataValues.character_id.toString() === i.values[0]
    )

     // Log the found character
     if (backlineCharacter) {
      console.log("Backline character found:", backlineCharacter);
    } else {
      console.log("Backline character not found");
    }


          // Proceed with battle setup if both characters are selected
          if (frontlineCharacter && backlineCharacter) {
            userBattles[userId] = true

            let enemy
            try {
              enemy = await selectEnemy()
            } catch (err) {
              await interaction.followUp('No enemies available for selection.')
              return
            }

            if (!enemy) {
              await interaction.followUp('Enemy not found.')
              return
            }

            // Initiate battle with selected characters and enemy
            const battleResult = await initiateBattle(
              frontlineCharacter.dataValues.character_id,
              backlineCharacter.dataValues.character_id,
              enemy.id,
              userId
            );

            console.log("Frontline character ID:", frontlineCharacter.dataValues.character_id);
            console.log("Backline character ID:", backlineCharacter.dataValues.character_id);
            

            const battleKey = `${frontlineCharacter.dataValues.character_id}-${backlineCharacter.dataValues.character_id}-${enemy.id}`
            battleManager[battleKey] = battleResult

            // Create and send an embed summarizing the battle initiation
            const embed = new EmbedBuilder()
              .setTitle('⚡Fight!')
              .setDescription(
                `**${userName}'s team** is looking for a fight and has found **${enemy.character_name}**!`
              )
              .addFields(
                {
                  name: `${frontlineCharacter.masterCharacter.character_name} (Frontline)`,
                  value: `⚔️ Damage: ${frontlineCharacter.effective_damage}, 🧡 Health: ${frontlineCharacter.effective_health}`,
                },
                {
                  name: `${backlineCharacter.masterCharacter.character_name} (Backline)`,
                  value: `⚔️ Damage: ${backlineCharacter.effective_damage}, 🧡 Health: ${backlineCharacter.effective_health}`,
                },
                {
                  name: `${enemy.character_name} (Enemy)`,
                  value: `⚔️ Damage: ${enemy.effective_damage}, 🧡 Health: ${enemy.effective_health}`,
                }
              )

            await interaction.followUp({ embeds: [embed] })
            // Stop the collector as we have both selections
            collector.stop()
          }
        }
      })

      collector.on('end', (collected) => {
        if (collected.size === 0) {
          interaction.followUp('Time has run out, no character selected.')
        }
      })
    } catch (error) {
      console.error('Error in execute:', error)
      await interaction.reply('An error occurred while executing the command.')
    }
  },
}
