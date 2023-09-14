const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require('discord.js')
const { retrieveCharacters } = require('./helpers/characterRetrieval')
const { selectEnemy } = require('./helpers/enemySelection')
const { initiateBattle } = require('./helpers/battle/initiateBattle')
const { battleLogic } = require('./helpers/battle/battleLogic')
const { battleManager } = require('./helpers/battle/battleManager')
const {
  CharacterInstance,
} = require('./helpers/characterFiles/characterInstance')

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('fight')
    .setDescription('Engage in combat'),

  async execute(interaction) {
    try {
      const userId = interaction.user.id

      // User character selection
      const userCharacters = await retrieveCharacters(userId)
      if (!userCharacters.length) {
        await interaction.reply('You have no characters to select.')
        return
      }

      const options = userCharacters.map((char) => {
        const {
          dataValues: { character_id },
          masterCharacter: {
            dataValues: { character_name, description },
          },
        } = char
        // console.log(
        //   `Character ID: ${character_id}, Character Name: ${character_name}, Description: ${description}`
        // )

        return new StringSelectMenuOptionBuilder()
          .setLabel(character_name) // Corrected the reference here
          .setValue(character_id.toString())
      })

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('characterSelect')
        .setPlaceholder('Select a character...')
        .addOptions(options)

      const actionRow = new ActionRowBuilder().addComponents(selectMenu)

      const characterEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Character Selection')

      await interaction.reply({
        embeds: [characterEmbed],
        components: [actionRow],
        ephemeral: true,
      })

      const filter = (i) => {
        i.deferUpdate()
        return i.customId === 'characterSelect'
      }

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 30000,
      })

      collector.on('collect', async (i) => {
        if (i.customId === 'characterSelect') {
          const selectedMasterCharacterID = i.values[0]
          console.log(selectedMasterCharacterID)
          const selectedCharacter = userCharacters.find((char) => {
            const {
              dataValues: { character_id },
              masterCharacter: {
                dataValues: { character_name },
              },
            } = char
            return character_id.toString() === selectedMasterCharacterID
          })
          if (selectedCharacter) {
            const {
              masterCharacter: {
                dataValues: { character_name },
              },
            } = selectedCharacter
            await interaction.followUp(
              `${i.user.tag}'s **${character_name}** is looking for a fight...`
            )
            // Enemy selection --------------------
            let enemy
            try {
              enemy = await selectEnemy()
            } catch (err) {
              await interaction.followUp('No enemies available for selection.')
              return
            }

            const enemyEmbed = new EmbedBuilder()
              .setColor('#ff0000')
              .setTitle('Enemy Selection')
              .setDescription(`...and has found ${enemy.name}`)
            // .addField('Description', enemy.description)

            await interaction.followUp({
              embeds: [enemyEmbed],
            })
            // Extract IDs
            const selectedCharacterId =
              selectedCharacter.dataValues.character_id
            const selectedEnemyId = enemy.id

            // Call the function to initiate battle
            const { characterInstance, enemyInstance } = await initiateBattle(
              selectedCharacterId,
              selectedEnemyId
            )

            const battleKey = `${selectedCharacterId}-${selectedEnemyId}`
            battleManager[battleKey] = { characterInstance, enemyInstance }
          }
        } else {
          await interaction.followUp(
            `No character found for ID ${selectedMasterCharacterID}.`
          )
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
