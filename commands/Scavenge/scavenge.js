// const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// const { User, Character, MasterCharacter } = require('../../Models/model.js');

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName('scavenge')
//     .setDescription('View the characters in your roster'),

//   async execute(interaction) {
//     const userId = interaction.user.id;

//     try {
//       const user = await User.findOne({
//         where: { user_id: userId },
//         include: [
//           {
//             model: Character,
//             as: 'characters',
//             include: [
//               {
//                 model: MasterCharacter,
//                 as: 'masterCharacter',
//                 attributes: { exclude: ['master_character_id'] },
//               },
//             ],
//           },
//         ],
//       });

//       if (!user) {
//         return interaction.reply('You do not have an account.');
//       }

//       const characters = user.characters || [];

//       if (characters.length === 0) {
//         return interaction.reply('Your roster is empty.');
//       }

//       const embed = new EmbedBuilder()
//         .setTitle('Character Collection')
//         .setColor('#0099ff');

//       const fields = characters.map((character) => {
//         const masterInfo = character.masterCharacter;
//         let rarityColor;

//       });

//       embed.addFields(fields);

//       return interaction.reply({ embeds: [embed] });

//     } catch (error) {
//       console.error(error);
//       return interaction.reply(
//         'Something went wrong while retrieving your roster.'
//       );
//     }
//   },
// };