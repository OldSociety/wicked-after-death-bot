require('dotenv').config()
const fs = require('node:fs')
const path = require('node:path')
// const { Sequelize } = require('sequelize')
const sequelize = require('./config/sequelize')

const {
  Client,
  Collection,
  GatewayIntentBits,
  EmbedBuilder,
} = require('discord.js')
// const { userInfo } = require('node:os')

const buttonInteractionHandler = require('./helpers/buttonInteraction');
const { postRandomQuestion } = require('./helpers/handleQuestion')
const { MasterCharacter } = require('./Models/model')
// const { scavengeHelper } = require('./helpers/scavengeHelper')

const channelId = process.env.WADCHANNELID

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
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
global.messageCounter = 0
// The number of messages to wait before sending a random message
// let messageThreshold = Math.floor(Math.random() * (25 - 15 + 1)) + 15

let messageThreshold = 3
global.isQuestionActive = false

// Listen for new messages
client.on('messageCreate', async (message) => {
  if (message.author.id === process.env.BOTADMINID || message.author.bot) {
    return
  }
  if (!global.isQuestionActive) {
    messageCounter++
    console.log(messageCounter)

    if (messageCounter >= messageThreshold) {
      global.messageCounter = 0 // Reset the message counter
      messageThreshold = Math.floor(Math.random() * (25 - 15 + 1)) + 15

      // try {
      //   // Fetch a random character from the database
      //   const characterCount = await MasterCharacter.count()
      //   const randomRow = Math.floor(Math.random() * characterCount)
      //   const randomCharacter = await MasterCharacter.findOne({
      //     offset: randomRow,
      //   })

      //   if (randomCharacter) {
      //     global.appearingCharacterName = randomCharacter.character_name;
      //     // Assuming channelId is fetched from .env and is the ID of the channel where you want to post
      //     const channel = await client.channels.fetch(channelId)
      //     if (channel) {
      //       // Send the character's name in the channel
      //       channel.send(`A wild ${randomCharacter.character_name} appears!`)
      //     }
      //   }
      // } catch (error) {
      //   console.error('Error fetching character:', error)
      // }

      try {
        global.isQuestionActive = true // Indicate a question is now active
        await postRandomQuestion(message.channel)
      } catch (error) {
        console.error('Error fetching question:', error)
      }
    }
  }
})

// Log in to Discord with your client's token
client.login(process.env.TOKEN)
module.exports = { sequelize } // Export the Sequelize instance
