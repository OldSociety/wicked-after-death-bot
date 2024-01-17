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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('store')
    .setDescription('Visit the store to purchase character packs and more.'),

  async execute(interaction) {
    const userId = interaction.user.id

    try {
      const user = await User.findOne({ where: { user_id: userId } })
      if (!user) return interaction.reply('You do not have an account.')

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
      });

      collector.on('collect', async (i) => {
        try {
          const selectedPackName = i.values[0];
          const purchaseResult = await handleCharacterPackPurchase(user, selectedPackName);
          if (purchaseResult.success) {
            await interaction.followUp({
              content: `You have successfully purchased the ${selectedPackName}.`,
              ephemeral: true,
            });
          } else {
            await interaction.followUp({
              content: purchaseResult.message,
              ephemeral: true,
            });
          }
        } catch (error) {
          console.error(error);
          interaction.followUp({
            content: 'There was an error processing your purchase.',
            ephemeral: true,
          });
        }
      });

      collector.on('end', () => {
        interaction.followUp({
          content: 'Store session ended.',
          ephemeral: true,
        });
      });
    } catch (error) {
      console.error(error);
      interaction.reply('Something went wrong while retrieving the store.');
    }
  },
};


// Assuming you have a function to handle character pack purchase
async function handleCharacterPackPurchase(user, packName) {
  let rarity;
  switch (packName) {
    case 'Bronze Box':
      rarity = 'commoner';
      break;
    // ... handle other cases
  }

  const transaction = await sequelize.transaction(); // Start a new transaction
  try {
    const randomCharacter = await MasterCharacter.findOne({
      where: { rarity: rarity },
      order: sequelize.random(),
    });

    if (!randomCharacter) {
      throw new Error('No characters found for the specified rarity.');
    }

    // Create a new Character instance for the user
    await Character.create({
      user_id: user.user_id,
        master_character_id: randomCharacter.master_character_id, // Set the master character ID
        level: 1, // Assuming a new character starts at level 1
        experience: 0, // Starting experience
        // Copy other fields from the MasterCharacter
        base_damage: randomCharacter.base_damage,
        base_health: randomCharacter.base_health,
        chance_to_hit: randomCharacter.chance_to_hit,
        crit_chance: randomCharacter.crit_chance,
        crit_damage: randomCharacter.crit_damage,
        // ... any other fields you need to set
      }, { transaction });

      await transaction.commit(); // Commit the transaction if all goes well
      return { success: true, message: 'Purchase successful.' };
    } catch (error) {
      await transaction.rollback(); // Rollback transaction on error
      console.error(error);
      return { success: false, message: 'Error processing purchase.' };
    }
  }
