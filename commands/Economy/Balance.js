const {
    SlashCommandBuilder,
    EmbedBuilder,
  } = require('discord.js')
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('balance')
      .setDescription('Check your economy balance'),
    async exectute(interaction) {
     
      if (!Data)
        return await interaction.reply({
          contend: `You must have an economy account to use this command.`,
          ephemeral: true,
        })
  
      const wallet = Math.round(Data.Wallet)
      const bank = Math.round(Data.Bank)
      const total = Math.round(Data.Wallet + Data.Bank)
  
      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Account Balance')
        .addFields({
          name: 'Balance',
          value: `**Bank:** $${bank}\n**Wallet:** $${wallet}\n**Total:** $${total}`,
        })
  
      await interaction.reply({ embeds: [embed] })
    },
  }
  