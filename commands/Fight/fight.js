// const { SlashCommandBuilder } = require('discord.js')
// const { User, Character, MasterCharacter } = require('../../Models/model.js')

// async function getAllPossibleEnemies() {
//   try {
//     return await MasterCharacter.findAll()
//   } catch (error) {
//     console.error('Error fetching enemies:', error)
//     return []
//   }
// }

// async function chooseEnemy() {
//   const enemies = await getAllPossibleEnemies()

//   if (enemies.length === 0) {
//     console.error('No enemies found to choose from.')
//     return null
//   }

//   const randomIndex = Math.floor(Math.random() * enemies.length)
//   return enemies[randomIndex]
// }

// // Function to conduct the fight
// async function conductFight(interaction, chosenCharacter) {
//   // Logic to handle the fight
// }

// module.exports = {
//   cooldown: 5,
//   data: new SlashCommandBuilder()
//     .setName('fight')
//     .setDescription('Initiate a fight')
//     .addSubcommand((subcommand) =>
//       subcommand
//         .setName('character')
//         .setDescription('Choose a character for the fight')
//         .addStringOption((option) =>
//           option
//             .setName('name')
//             .setDescription('The name of the character')
//             .setRequired(true)
//         )
//     ),
//   async execute(interaction) {
//     try {
//       // Extract character name from interaction
//       const characterName = interaction.options.getString('name')

//       // Fetch the user's character from the database
//       const userCharacters = await Character.findAll({
//         where: { user_id: interaction.user.id },
//       })

//       // Logic to find the chosen character
//       const chosenCharacter = userCharacters.find(
//         (c) => c.name === characterName
//       )

//       // Choose the enemy character
//       const enemy = chooseEnemy()

//       // Conduct the fight
//       await conductFight(interaction, chosenCharacter, enemy)
//     } catch (error) {
//       console.error('Error in initiating fight:', error)
//       return interaction.reply(
//         'Something went wrong while trying to start the battle.'
//       )
//     }
//   },
// }
