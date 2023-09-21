const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
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
      });

      if (!user) {
        return interaction.reply('You do not have an account.')
      }

      const characters = user.characters || []

      if (characters.length === 0) {
        return interaction.reply('Your roster is empty.')
      }

      const options = characters.map((character) => {
        return {
          label: character.masterCharacter.character_name,
          value: character.character_id.toString(),
          description: `Lvl ${character.level}`,
        }
      })

      const selectMenu = new MessageSelectMenu()
        .setCustomId('characterSelect')
        .setPlaceholder('Select a character')
        .addOptions(options)

      const actionRow = new MessageActionRow().addComponents(selectMenu)

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
          const detailEmbed = new EmbedBuilder()
            .setTitle(`${selectedCharacter.masterCharacter.character_name}`)
            .addField('Level', selectedCharacter.level.toString())
            .addField('Experience', selectedCharacter.experience.toString())
            .addField('Base Damage', selectedCharacter.masterCharacter.base_damage.toString())
            .addField('Base Health', selectedCharacter.masterCharacter.base_health.toString());
            
          // Add more fields as needed
      
          await interaction.followUp({ embeds: [detailEmbed] });
        } else {
          await interaction.followUp('Character not found.');
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
