const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { User, Character } = require('../../Models/model.js')

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('fight')
    .setDescription('Engage in combat')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('select_character')
        .setDescription('Choose your character for the fight')
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'select_character') {
      const userId = interaction.user.id

      // Retrieve User's Characters
      const userCharacters = await Character.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Character,
            as: 'characters',
            include: [
              {
                model: MasterCharacter,
                as: 'masterCharacter',
              },
            ],
          },
        ],
      })

      if (!userCharacters.length) {
        await interaction.reply('You have no characters to select.')
        return
      }

      const characterList = userCharacters.map((character, index) => 
        `${index + 1}. ${character.masterCharacter.name}`
      ).join('\n');

      // Character Selection Embed
      const characterSelectionEmbed = new EmbedBuilder()
        .setTitle('Choose Your Character')
        .setDescription(characterList)
        .setColor('#0099ff')

      await interaction.reply({
        embeds: [characterSelectionEmbed],
        ephemeral: true, // Make it only visible to the user
      })

      // You can later add code here to handle reactions for character selection
    }
  },
}
