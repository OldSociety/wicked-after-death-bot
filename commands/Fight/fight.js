const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require('discord.js')

const { User, MasterCharacter } = require('../../Models/model.js')

// HELPERS
const { retrieveCharacters } = require('./helpers/characterRetrieval')
const { initiateBattle } = require('./helpers/battle/initiateBattle')
const { initializeDeck } = require('./helpers/battle/initializeDeck.js')
const { selectEnemy } = require('./helpers/enemySelection.js')
const { battleManager, userBattles } = require('./helpers/battle/battleManager')
const {
  setupBattleLogic,
} = require('./helpers/battle/battleLogic/battleLogic.js')

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('fight')
    .setDescription('Engage in combat'),

  async execute(interaction) {
    try {
      const userId = interaction.user.id
      const userName = interaction.user.username

      const user = await User.findOne({
        where: { user_id: userId },
      })
      if (!user) {
        await interaction.reply({
          content: "You don't have an account. Use `/account` to create one.",
          ephemeral: true,
        })
        return
      }

      const chosenEnemy = await selectEnemy()

      const enemyName = chosenEnemy.character_name
      console.log('FIGHTING: ', enemyName)
      if (!enemyName) {
        await interaction.reply('No character has appeared to fight with.')
        return
      }

      const enemy = await MasterCharacter.findOne({
        where: { character_name: enemyName },
      })

      // console.log(enemy)
      if (!enemy) {
        await interaction.reply(
          "The character you're trying to fight with doesn't exist."
        )
        return
      }

      const userCharacters = await retrieveCharacters(userId)
      if (!userCharacters.length) {
        await interaction.editReply('You have no characters to select.')
        return
      }

      const options = userCharacters.map((char) => {
        const rarityColor =
          {
            rare: '🟩',
            epic: '🟦',
            legendary: '🟪',
          }[char.rarity] || '⬜'
        return new StringSelectMenuOptionBuilder()
          .setLabel(`${rarityColor} ${char.masterCharacter.character_name}`)
          .setValue(char.character_id.toString())
      })

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('characterSelect')
        .setPlaceholder('Select your character...')
        .addOptions(options)

      const actionRow = new ActionRowBuilder().addComponents(selectMenu)
      const characterEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Character Selection')

      await interaction.deferReply({ ephemeral: true })

      await interaction.editReply({
        embeds: [characterEmbed],
        components: [actionRow],
        ephemeral: true,
      })

      const filter = (i) => {
        i.deferUpdate()
        return i.customId === 'characterSelect'
      }

      // Collector for character selection
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 30000,
      })

      collector.on('collect', async (i) => {
        if (userBattles[userId]) {
          await interaction.followUp('You are already in an ongoing battle.')
          return
        }

        const characterId = i.values[0] // Capture the selected character ID
        const character = userCharacters.find(
          (char) => char.character_id.toString() === characterId
        )

        if (character) {
          userBattles[userId] = true
          const battleResult = await initiateBattle(
            character.dataValues.character_id,
            character.masterCharacter.master_character_id,
            enemy.master_character_id,
            userId
          )

          // Initialize the deck for the battle
          const deck = initializeDeck()
          const battleKey = `${character.dataValues.character_id}-${enemy.master_character_id}`
          battleManager[battleKey] = battleResult

          // Create and send an embed summarizing the deck and ask for confirmation to start battle
          const embed = new EmbedBuilder()
            .setTitle(`⚡${userName} - Battle Deck Ready`)
            .setColor('DarkRed')
            .setDescription(
              `Deck initialized with ${deck.length} cards. Ready to fight against ${enemy.character_name}?`
            )

          const confirmButton = new ButtonBuilder()
            .setCustomId('confirm_fight')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success)

          const backButton = new ButtonBuilder()
            .setCustomId('back_fight')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)

          const buttonRow = new ActionRowBuilder().addComponents(
            confirmButton,
            backButton
          )

          await interaction.editReply({
            embeds: [embed],
            components: [buttonRow],
          })

          const buttonFilter = (i) => i.user.id === userId
          const buttonCollector =
            interaction.channel.createMessageComponentCollector({
              filter: buttonFilter,
              time: 15000,
            })

          buttonCollector.on('collect', async (i) => {
            if (i.customId === 'confirm_fight') {
              await i.deferReply({ ephemeral: true })
              await setupBattleLogic(userId, userName, i, deck)
              await i.editReply({
                content: 'Battle initiated!',
              })
            } else if (i.customId === 'back_fight') {
              await i.reply({
                content: 'Battle aborted.',
                ephemeral: true,
              })
            }
          })

          buttonCollector.on('end', (collected) => {
            if (collected.size === 0) {
              interaction.followUp('No response, battle aborted.')
              delete userBattles[userId]
            }
          })
          collector.stop()
        }
      })

      collector.on('end', (collected) => {
        if (collected.size === 0) {
          interaction.followUp('Time has run out, no character selected.')
        }
      })
    } catch (error) {
      console.error('Error in execute:', error)
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply(
          'An error occurred while executing the command.'
        )
      } else {
        await interaction.followUp(
          'An error occurred while executing the command.'
        )
      }
    }
  },
}
