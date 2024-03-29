const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js')
const {
  User,
  Character,
  MasterCharacter,
  Store,
} = require('../../Models/model.js')
const sequelize = require('../../config/sequelize.js')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('store')
    .setDescription('Visit the store to purchase character packs and more.'),

  async execute(interaction) {
    const userId = interaction.user.id

    try {
      const user = await User.findOne({ where: { user_id: userId } })
      if (!user) return interaction.reply('You do not have an account. Use `/account` to get started.')

      const storeItems = await Store.findAll()

      const storeEmbed = new EmbedBuilder()
        .setTitle('Character Store')
        .setDescription('Select a pack to purchase:')
        .setColor('#0099ff')

      storeItems.forEach((item) => {
        storeEmbed.addFields({ name: item.name, value: `Cost: ${item.cost}` })
      })

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('storeSelect')
        .setPlaceholder('Select a pack...')
        .addOptions(
          storeItems.map((item) => ({
            label: item.name,
            description: `Cost: ${item.cost}`,
            value: item.name,
          }))
        )

      const actionRow = new ActionRowBuilder().addComponents(selectMenu)

      await interaction.reply({
        embeds: [storeEmbed],
        components: [actionRow],
        ephemeral: true,
      })

      const collector = interaction.channel.createMessageComponentCollector({
        filter: (i) => i.customId === 'storeSelect' && i.user.id === userId,
        time: 30000, // Adjust time as needed
      })

      collector.on('collect', async (i) => {
        try {
          await i.deferReply({ ephemeral: false }) // Defer the reply
          const selectedPackName = i.values[0]
          const purchaseResult = await handleCharacterPackPurchase(
            user,
            selectedPackName
          )

          // Edit the deferred reply with the purchase result
          await i.editReply({
            content: purchaseResult.message,
          })
          collector.stop() // Stop the collector after handling the purchase
        } catch (error) {
          console.error(error)
          // Edit the deferred reply in case of an error
          await i.editReply({
            content: 'There was an error processing your purchase.',
          })
        }
      })

      // collector.on('end', () => {
      //   interaction.followUp({
      //     content: 'Store session ended.',
      //     ephemeral: true,
      //   });
      // });
    } catch (error) {
      console.error(error)
      interaction.reply('Something went wrong while retrieving the store.')
    }
  },
}

async function handleCharacterPackPurchase(user, packName) {
  let rarity
  switch (packName) {
    case 'Bronze Box':
      rarity = '⚪ Common'
      break
    // ... handle other cases
  }

  const transaction = await sequelize.transaction()
  try {
    // Retrieve the cost of the pack
    const pack = await Store.findOne({
      where: { name: packName },
    })
    if (!pack) {
      throw new Error(`Pack ${packName} not found.`)
    }

    // Check if user has enough balance
    if (user.balance < pack.cost) {
      return {
        success: false,
        message: `Insufficient balance to purchase ${packName}.`,
      }
    }

    const randomCharacter = await MasterCharacter.findOne({
      where: { rarity: rarity },
      order: sequelize.random(),
    })

    if (!randomCharacter) {
      throw new Error('No characters found for the specified rarity.')
    }

    // Check if the user already has this character
    const existingCharacter = await Character.findOne({
      where: {
        user_id: user.user_id,
        master_character_id: randomCharacter.master_character_id,
      },
      transaction,
    })

    if (existingCharacter) {
      // User already has this character, increment copies
      existingCharacter.copies += 1
      await existingCharacter.save({ transaction })
    } else {
      // Create a new Character instance for the user
      await Character.create(
        {
          user_id: user.user_id,
          master_character_id: randomCharacter.master_character_id,
          level: 1,
          rank: 1,
          copies: 0,
          experience: 0,
          base_damage: randomCharacter.base_damage,
          base_health: randomCharacter.base_health,
          chance_to_hit: randomCharacter.chance_to_hit,
          crit_chance: randomCharacter.crit_chance,
          crit_damage: randomCharacter.crit_damage,
        },
        { transaction }
      )
    }

    // Deduct the cost from user's balance and save
    user.balance -= pack.cost
    await user.save({ transaction })

    await transaction.commit() // Commit the transaction if all goes well
    return {
      success: true,
      message: existingCharacter
        ? `You found another copy of ${randomCharacter.character_name}.`
        : `You have successfully purchased the ${packName} and found ${randomCharacter.character_name}.`,
    }
  } catch (error) {
    await transaction.rollback() // Rollback transaction on error
    console.error(error)
    collector.stop() // Stop the collector after sending the character details
    return { success: false, message: 'Error processing purchase.' }
  }
}
