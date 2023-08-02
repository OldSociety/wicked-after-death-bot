const { Events } = require('discord.js')

module.exports.run = {}

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    async () => {
      const storedBalances = await Users.findAll()
      storedBalances.forEach((b) => currency.set(b.user_id, b))
    }
    console.log(`Ready! Logged in as ${client.user.tag}`)
  },
}
