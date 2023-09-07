// Require the necessary discord.js classes
require('dotenv').config()
const fs = require('node:fs')
const path = require('node:path')
const { Sequelize } = require('sequelize')

const { Client, Collection, GatewayIntentBits } = require('discord.js')
const { userInfo } = require('node:os')

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

// Set the prefix - NOT WORKING
const prefix = "!";
getPrefix = (client, message) => {
  // try {
  //   const data = fs.readFileSync('prefixes.json', 'utf-8');
  //   const prefixes = JSON.parse(data);
  //   if (prefixes.hasOwnProperty(message.guild.id)) {
  //     return prefixes[message.guild.id];
  //   }
  // } catch (error) {
  //   console.error('Error reading prefixes.json:', error);
  // }

  // If the prefix is not found, set a default prefix and save it to the file
  const defaultPrefix = '!';
  try {
    const data = fs.readFileSync('prefixes.json', 'utf-8');
    const prefixes = JSON.parse(data);
    prefixes[message.guild.id] = defaultPrefix;
    fs.writeFileSync('prefixes.json', JSON.stringify(prefixes, null, 2));
  } catch (error) {
    console.error('Error writing prefixes.json:', error);
  }

  return defaultPrefix;
}


// Create a Sequelize instance with your configuration
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'database.sqlite',
});


// Log in to Discord with your client's token
client.login(process.env.TOKEN)
module.exports = sequelize // Export the Sequelize instance
