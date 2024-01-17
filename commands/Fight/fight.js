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
        .setPlaceholder('Select your frontlane character...')
        .addOptions(options)

      const actionRow = new ActionRowBuilder().addComponents(selectMenu)

      const characterEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Character Selection')

      await interaction.reply({
        embeds: [characterEmbed],
        components: [actionRow],
        ephemeral: true,
        content: 'Select your frontlane character',
      })

      const filter = (i) => {
        i.deferUpdate()
        return (
          i.customId === 'characterSelect' ||
          i.customId === 'backlaneCharacterSelect'
        )
      }

      // Collector for character selection
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 30000,
      })

      let frontlaneCharacter, backlaneCharacter
      let frontlaneCharacterId

      collector.on('collect', async (i) => {
        if (userBattles[userId]) {
          await interaction.followUp('You are already in an ongoing battle.')
          return
        }

        if (!frontlaneCharacter && i.customId === 'characterSelect') {
          frontlaneCharacterId = i.values[0] // Capture the selected frontlane character ID
          frontlaneCharacter = userCharacters.find(
            (char) =>
              char.dataValues.character_id.toString() === frontlaneCharacterId
          )

          // Filter options to exclude the selected frontlane character
          const backlaneOptions = userCharacters
            .filter(
              (char) =>
                char.dataValues.character_id.toString() !== frontlaneCharacterId
            )
            .map((char) => {
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

              return new StringSelectMenuOptionBuilder()
                .setLabel(`${rarityColor} ${char.masterCharacter.character_name}`)
                .setValue(char.dataValues.character_id.toString())
            })

          const backlaneSelectMenu = new StringSelectMenuBuilder()
            .setCustomId('backlaneCharacterSelect')
            .setPlaceholder('Select your backlane character...')
            .addOptions(backlaneOptions)

          await interaction.editReply({
            content: 'Select your backlane character',
            components: [
              new ActionRowBuilder().addComponents(backlaneSelectMenu),
            ],
          })
        } else if (
          !backlaneCharacter &&
          i.customId === 'backlaneCharacterSelect'
        ) {
          const selectedBacklaneCharacterId = i.values[0]
          // Ensure backlane character is different from frontlane character
          if (selectedBacklaneCharacterId === frontlaneCharacterId) {
            await interaction.followUp(
              "You can't select the same character for both frontlane and backlane."
            )
            return
          }
          backlaneCharacter = userCharacters.find(
            (char) =>
              char.dataValues.character_id.toString() ===
              selectedBacklaneCharacterId
          )

          // Proceed with battle setup if both characters are selected
          if (frontlaneCharacter && backlaneCharacter) {
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
              frontlaneCharacter.dataValues.character_id,
              frontlaneCharacter.masterCharacter.master_character_id,
              backlaneCharacter.dataValues.character_id,
              backlaneCharacter.masterCharacter.master_character_id,
              enemy.id,
              userId
            )

            const battleKey = `${frontlaneCharacter.dataValues.character_id}-${backlaneCharacter.dataValues.character_id}-${enemy.id}`
            battleManager[battleKey] = battleResult

            // Create and send an embed summarizing the battle initiation
            const embed = new EmbedBuilder()
              .setTitle('⚡Fight!')
              .setDescription(
                `**${userName}'s team** is looking for a fight and has found **${enemy.character_name}**!`
              )
              .addFields(
                {
                  name: `${frontlaneCharacter.masterCharacter.character_name} (Frontlane)`,
                  value: `⚔️ Damage: ${frontlaneCharacter.effective_damage}, 🧡 Health: ${frontlaneCharacter.effective_health}`,
                },
                {
                  name: `${backlaneCharacter.masterCharacter.character_name} (Backlane)`,
                  value: `⚔️ Damage: ${backlaneCharacter.effective_damage}, 🧡 Health: ${backlaneCharacter.effective_health}`,
                },
                {
                  name: '\u200B', // Zero-width space
                  value: '\u200B', // Zero-width space
                },
                {
                  name: `${enemy.character_name} (Enemy)`,
                  value: `⚔️ Damage: ${enemy.effective_damage}, 🧡 Health: ${enemy.effective_health}`,
                }
              )

            // Call setupBattleLogic after initiating the battle
            setupBattleLogic(userId, userName, interaction)

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
