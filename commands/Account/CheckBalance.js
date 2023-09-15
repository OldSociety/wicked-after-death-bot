// const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
// const { User, Character, MasterCharacter } = require('../../Models/model.js')

// module.exports = {
//   cooldown: 5,
//   data: new SlashCommandBuilder()
//     .setName('balance')
//     .setDescription('Check your account balance'),
//   async execute(interaction) {
//     const userId = interaction.user.id

//     try {
//       const user = await User.findOne({
//         where: { user_id: userId },
//       })

//       if (user) {
//         const color = parseInt('0099ff', 16)
//         const embedReset = new EmbedBuilder()
//           .setDescription(
//             `You currently have ${user.balance} gold in your account.`
//           )
//           .setColor(color)

//         await interaction.reply({
//           embeds: [embedReset],
//           ephemeral: true,
//         })
//       } else {
//         const color = parseInt('0099ff', 16)
//         const embedReset = new EmbedBuilder()
//           .setDescription(
//             `You do not have an account yet. Use /create to get started.`
//           )
//           .setColor(color)

//         await interaction.reply({
//           embeds: [embedReset],
//           ephemeral: true,
//         })
//       }
//       embed.addFields(fields);

//       return interaction.reply({ embeds: [embed] });
//     } catch (error) {
//       console.error('Error in checking balance:', error)
//       return interaction.reply(
//         'Something went wrong while checking your account balance.'
//       )
//     }
//   },
// }
