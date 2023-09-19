// jest.mock('@discordjs/builders');
// const { SlashCommandBuilder } = require('@discordjs/builders')
// console.log(SlashCommandBuilder) // Should output mock function if correctly mocked

// const { Client } = require('discord.js')
// const { TOKEN } = process.env
const cron = require('node-cron')

test('it should pass', () => {
  expect(true).toBe(true)
})

// // Mock Discord.js Client
// jest.mock('discord.js', () => {
//   return {
//     Client: jest.fn().mockImplementation(() => {
//       return {
//         login: jest.fn(),
//         commands: { set: jest.fn() }, // Mocking Collection's set function
//       }
//     }),
//     GatewayIntentBits: {
//       Guilds: jest.fn(),
//       GuildMessages: jest.fn(),
//       GuildVoiceStates: jest.fn(),
//     },
//     Collection: jest.fn().mockImplementation(() => {
//       return { set: jest.fn() }
//     }),
//   }
// })

// // Import this at the top of your test file
jest.mock('node-cron', () => {
  return {
    schedule: jest.fn(),
  }
})

// // Your existing tests

// // Create an instance of your mocked Client class
// const client = new Client()

// require('../app')

// test('Bot should log in', () => {
//   // Check that login was called with your TOKEN
//   expect(client.login).toHaveBeenCalledWith(TOKEN)
// })
