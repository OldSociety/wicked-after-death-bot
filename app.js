require('dotenv').config()
const fs = require('node:fs')
const path = require('node:path')
const { Sequelize } = require('sequelize')
const sequelize = require('./config/sequelize')

const { Client, Collection, GatewayIntentBits } = require('discord.js')
const { userInfo } = require('node:os')
const buttonInteractionHandler = require('./helpers/buttonInteraction')
const { scavengeHelper } = require('./helpers/scavengeHelper')

// // Import Redis
// const Redis = require('ioredis');
// const redisClient = new Redis(); // You can pass options like port and host here.

// redisClient.on('error', (error) => {
//   console.error(`Redis error: ${error}`);
// });

// // Sample Redis operations
// redisClient.set('foo', 'bar');
// redisClient.get('foo', (err, result) => {
//   if (err) {
//     console.error(`Error getting value: ${err}`);
//   } else {
//     console.log(`Result: ${result}`); // Should print "bar"
//   }
// });

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
})

global.client = client

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
  await buttonInteractionHandler.execute(interaction)
})

// Counter for tracking the number of messages
let messageCounter = 0
// The number of messages to wait before sending a random message
const messageThreshold = 10
const randomMessages = [
  'This is quite the active conversation!',
  'Love the energy in this server right now!',
  'So many voices, so much to learn!',
  'You all are on fire today!',
  'The diversity of thoughts here is amazing!',
]

// Listen for new messages
client.on('messageCreate', (message) => {
  // Increment the message counter
  messageCounter++

  // Check if the message counter reaches the threshold
  if (messageCounter >= messageThreshold) {
    // Reset the message counter
    messageCounter = 0
    // Send a random message from the array
    Math.floor(Math.random() * (25 - 15 + 1)) + 15

    message.channel.send(randomMessages[randomIndex])
  }
})

// Log in to Discord with your client's token
client.login(process.env.TOKEN)
module.exports = { sequelize } // Export the Sequelize instance
