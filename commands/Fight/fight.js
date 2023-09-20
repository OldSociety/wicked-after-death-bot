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

      const userCharacters = await retrieveCharacters(userId)
      if (!userCharacters.length) {
        await interaction.reply('You have no characters to select.')
        return
      }

      const options = userCharacters.map((char) => {
        const {
          dataValues: { character_id },
          masterCharacter: {
            dataValues: { character_name },
          },
        } = char

        return new StringSelectMenuOptionBuilder()
          .setLabel(character_name)
          .setValue(character_id.toString())
      })

      if (userBattles[userId]) {
        await interaction.reply('You are already in an ongoing battle.')
        return
      }

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
        const selectedMasterCharacterID = i.values[0]
        const selectedCharacter = userCharacters.find(
          (char) =>
            char.dataValues.character_id.toString() ===
            selectedMasterCharacterID
        )

        if (!selectedCharacter) {
          await interaction.followUp(
            `No character found for ID ${selectedMasterCharacterID}.`
          )
          return
        }

        const {
          masterCharacter: {
            dataValues: { character_name, master_character_id },
          },
        } = selectedCharacter

        await interaction.followUp(
          `${i.user.tag}'s **${character_name}** is looking for a fight...`
        )

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
        const enemyEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('Enemy Selection')
          .setDescription(`...and has found ${enemy.character_name}`)

        await interaction.followUp({
          embeds: [enemyEmbed],
        })
        const selectedCharacterId = selectedCharacter.dataValues.character_id
        const selectedEnemyId = enemy.id // Assuming enemy object has 'id' field
        const masterCharacterId = master_character_id

        console.log(selectedCharacterId, selectedEnemyId, masterCharacterId)

        userBattles[userId] = true
        const { masterCharacter, characterInstance, enemyInstance } =
          await initiateBattle(
            masterCharacterId,
            selectedCharacterId,
            selectedEnemyId
          )

        const battleKey = `${selectedCharacterId}-${selectedEnemyId}`
        battleManager[battleKey] = { characterInstance, enemyInstance }

        setupBattleLogic()
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
