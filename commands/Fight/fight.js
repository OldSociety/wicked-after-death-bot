const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require('discord.js')

const { User } = require('../../Models/model.js')

// HELPERS
const { retrieveCharacters } = require('./helpers/characterRetrieval')
const { selectLevel } = require('./helpers/levelSelection/levelSelection')
const { selectRaid } = require('./helpers/levelSelection/raidSelection')
const { selectFight } = require('./helpers/levelSelection/fightSelection')
const { initiateBattle } = require('./helpers/battle/initiateBattle')
const { battleManager, userBattles } = require('./helpers/battle/battleManager')
// const { setupBattleLogic } = require('./helpers/battle/battleLogic.js')
const { setupBattleLogic } = require('./helpers/battle/battleLogicAuto.js')

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
        where: { user_id: interaction.user.id },
      })

      console.log(interaction.user)

      if (!user) {
        await interaction.reply({
          content: "You don't have an account. Use `/account` to create one.",
          ephemeral: true,
        })
        return
      }

      await interaction.deferReply({ ephemeral: true })

      const selectedLevelId = await selectLevel(interaction)
      if (!selectedLevelId) {
        return interaction.editReply('No level selected.')
      }

      const selectedRaidId = await selectRaid(interaction, selectedLevelId)
      if (!selectedRaidId) {
        return interaction.editReply('No raid selected.')
      }

      const selectedFight = await selectFight(interaction, selectedRaidId)
      if (!selectedFight || !selectedFight.enemy) {
        return interaction.editReply('No fight selected.')
      }

      const enemy = selectedFight.enemy.dataValues

      const userCharacters = await retrieveCharacters(userId)
      if (!userCharacters.length) {
        return interaction.editReply('You have no characters to select.')
      }

      const options = userCharacters.map((char) => {
        const rarityColor =
          {
            'folk hero': '🟩',
            legend: '🟦',
            unique: '🟪',
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

      await interaction.editReply({
        embeds: [characterEmbed],
        components: [actionRow],
        ephemeral: true,
      })

      const filter = (i) => {
        i.deferUpdate()
        return (
          i.customId === 'characterSelect'
        )
      }

      // Collector for character selection
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 30000,
      })

      let character
      let characterId

      collector.on('collect', async (i) => {
        if (userBattles[userId]) {
          await interaction.followUp('You are already in an ongoing battle.')
          return
        }

        if (!character && i.customId === 'characterSelect') {
          characterId = i.values[0] // Capture the selected character ID
          character = userCharacters.find(
            (char) =>
              char.dataValues.character_id.toString() === characterId
          )


          // Proceed with battle setup if both characters are selected
            if (character) {
            userBattles[userId] = true

            if (!enemy) {
              await interaction.followUp('Enemy not found.')
              return
            }

            // Initiate battle with selected characters and enemy
            const battleResult = await initiateBattle(
              character.dataValues.character_id,
              character.masterCharacter.master_character_id,
              enemy.enemy_id,
              userId
            )

            const battleKey = `${character.dataValues.character_id}-${enemy.id}`

            battleManager[battleKey] = battleResult
  
            // Create and send an embed summarizing the battle initiation
            const embed = new EmbedBuilder()
              .setTitle(`⚡${userName}'s ${character.masterCharacter.character_name}`).setColor('DarkRed')
              .setThumbnail(interaction.user.displayAvatarURL())
              .setTimestamp()
              .setDescription(
                `is looking for a fight and has found the **${enemy.character_name}**!`
              )
              .addFields(
                createCharacterField(character),
                {
                  name: '\u200B', // Zero-width space
                  value: '\u200B', // Zero-width space
                },
                {
                  name:
                    `${enemy.character_name}`,
                  value: `⚔️ Damage: ${enemy.effective_damage}, 🧡 Health: ${enemy.effective_health}`,
                }
              )

            // Function to create a field for a character
            function createCharacterField(character) {
              const effectiveDamage =
                character.effective_damage ||
                character.masterCharacter.base_damage
              const effectiveHealth =
                character.effective_health ||
                character.masterCharacter.base_health

              return {
                name:
                  `${character.masterCharacter.character_name} | Level ` +
                  '`' +
                  character.level.toString() +
                  '`',
                value: `⚔️ Damage: ${effectiveDamage}, 🧡 Health: ${effectiveHealth}`,
              }
            }
            // embed.setImage('https://cdn.discordapp.com/attachments/1149795132426694826/1199900841944031373/IMG_8846.webp?ex=65c439bd&is=65b1c4bd&hm=078c43059c889e84e9ed20cb97ddda4cf0c6c157780635bb2e542ab2b49ae647&')

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
