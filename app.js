// Require the necessary discord.js classes
require('dotenv').config()
const fs = require('node:fs')
const path = require('node:path')
const { Sequelize } = require('sequelize')
const sequelize = require('./Utils/sequelize')

const { Client, Collection, GatewayIntentBits } = require('discord.js')
const { userInfo } = require('node:os')
const buttonInteractionHandler = require('./helpers/buttonInteraction')

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
})

client.cooldowns = new Collection()
client.commands = new Collection()
const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder)
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'))
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command)
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      )
    }
  }
}

// Dynamically Read file paths
const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith('.js'))

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file)
  const event = require(filePath)
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

client.on('interactionCreate', async (interaction) => {
  await buttonInteractionHandler.execute(interaction);
});

// Guild specific command set-up
// client.once('ready', async () => {

//   const guildId = process.env.GUILDID; // Replace with your guild's ID

//   try {
//     const guild = await client.guilds.fetch(guildId);
//     if (!guild) {
//       return console.error('Guild not found');
//     }

//     const accountManagementCommand = {
//       name: 'account_management',
//       description: 'Manage user accounts (DM ONLY)',
//       // ... other fields like subcommands, options, etc.
//     };

//     await guild.commands.create(accountManagementCommand);
//     console.log('Guild-specific command registered');
//   } catch (error) {
//     console.error('An error occurred:', error);
//   }
// });


// Log in to Discord with your client's token
client.login(process.env.TOKEN)
module.exports = sequelize // Export the Sequelize instance
