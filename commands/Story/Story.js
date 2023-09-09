const { SlashCommandBuilder } = require('discord.js');
const { User, Character, MasterCharacter } = require('../../Models/models.js');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('story')
    .setDescription('Read the story behind Hellbound: Wicked after Death.'),
  async execute(interaction) {
    try {
        await interaction.reply({
            content: "In the multiverse, countless versions of Meridian exist, spinning in endless variation. And each boasts its own heroes and legends—all eager to tell their tale. However, on one world, fate took a very dark turn.\nWhen their heroes fell, hell was unleashed, and demons now rule the ashes. Some have survived over the years, trapped beneath the apocalypse, trying to resist what was once just a prophecy, the 'Inevitable End.'\n\nYet, in the catastrophic event that ended everything, time spiraled in on itself. The past was pulled forward, and countless younger versions of both heroes and villains were reborn into this dying world, stripped of their never-to-be triumphs and sins. Now they do the only thing left to do: fight back.\n\nSo... are you ready to join them? Welcome to Hellbound: Wicked after Death, the ultimate battle for survival in a world that's already gone to hell.",
            ephemeral: true,
          })
      }
    catch (error) {
      console.error('Error retrieving the story', error);
      return interaction.reply('Something went wrong while trying to retrieve the story.');
    }
  },
};
