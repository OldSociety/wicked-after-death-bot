const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require('discord.js')
const { User, Character, MasterCharacter } = require('../../Models/model.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('collection')
    .setDescription('View the characters in your roster'),

  async execute(interaction) {
    const userId = interaction.user.id

    try {
      const user = await User.findOne({
        where: { user_id: userId },
        include: [
          {
            model: Character,
            as: 'characters',
            include: [
              {
                model: MasterCharacter,
                as: 'masterCharacter',
                attributes: { exclude: ['master_character_id'] },
              },
            ],
          },
        ],
      })

      if (!user) {
        return interaction.reply('You do not have an account.')
      }

      const characters = user.characters || []

      if (characters.length === 0) {
        return interaction.reply('Your roster is empty.')
      }

      const options = characters.map((character) => {
        let rarityColor

        // Decide the font color based on the rarity
        switch (character.masterCharacter.rarity) {
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
          .setLabel(
            `${rarityColor} ${character.masterCharacter.character_name}`
          ) // added rarityColor icon next to the name
          .setValue(character.character_id.toString())
          .setDescription(`Lvl ${character.level}`)
      })

      let selectMenu = new StringSelectMenuBuilder()
        .setCustomId('characterSelect')
        .setPlaceholder('Select a character')
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
        const selectedCharacterID = i.values[0]
        const selectedCharacter = characters.find(
          (char) => char.character_id.toString() === selectedCharacterID
        )

        if (selectedCharacter) {
          switch (selectedCharacter.masterCharacter.rarity) {
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

          const detailEmbed = new EmbedBuilder()
            .setTitle(
              `${rarityColor}` +
                '\u00A0'.repeat(3) +
                `${selectedCharacter.masterCharacter.character_name}`
            )
            .setDescription(`${selectedCharacter.masterCharacter.description}`)
            .addFields(
              {
                name: 'Level',
                value:
                  '`' +
                  selectedCharacter.level.toString() +
                  '`',
                  inline: true
              },
              {
                name: 'Experience',
                value:
                '`' +
                selectedCharacter.experience.toString() +
                ' / ' +
                selectedCharacter.xp_needed.toString() +
                '`',
                  inline: true
              },
              {
                name: 'Damage',
                value:
                  '`⚔️' +
                  selectedCharacter.masterCharacter.base_damage.toString() +
                  '`',
                inline: true,
              },
              {
                name: 'Health',
                value:
                  '`🧡' +
                  selectedCharacter.masterCharacter.base_health.toString() +
                  '`',
                inline: true,
              },
              {
                name: 'Crit Chances',
                value:
                  '`🎯' +
                  selectedCharacter.masterCharacter.crit_chance.toString() +
                  '`',
                inline: true,
              },
              {
                name: 'Crit Damage',
                value:
                  '`💥' +
                  selectedCharacter.masterCharacter.crit_damage.toString() +
                  '`',
                inline: true,
              },
              
              // {
              //   name: 'Damage' + '\u00A0'.repeat(10) + 'Health',
              //   value:
              //     '`⚔️' +
              //     selectedCharacter.masterCharacter.base_damage.toString() +
              //     '`' +
              //     '\u00A0'.repeat(12) +
              //     '`🧡' +
              //     selectedCharacter.masterCharacter.base_health.toString() +
              //     '`',
              // }
            )

            await interaction.followUp({ embeds: [detailEmbed], ephemeral: true });
            collector.stop(); // Stop the collector after sending the character details
          } else {
            await interaction.followUp('Character not found.');
            collector.stop(); // Optionally, also stop the collector in case of not found
          }
      })
    } catch (error) {
      console.error(error)
      return interaction.reply(
        'Something went wrong while retrieving your roster.'
      )
    }
  },
}
