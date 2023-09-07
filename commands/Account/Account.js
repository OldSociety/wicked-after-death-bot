const { SlashCommandBuilder } = require('discord.js');
const { DataTypes } = require('sequelize');
const sequelize = require('../../Utils/sequelize');
const User = require('../../Models/User')(sequelize, DataTypes);
const Collection = require('../../Models/Collection')(sequelize, DataTypes);
const CharacterList = require('../../db/dbCharacters'); // Import your character data

// Define an array of specific character_ids to be added to the new user's collection
const specificCharacterIds = [0, 1, 2];

// Function to add collection to existing accounts
async function addCollectionToExistingAccounts() {
  try {
    // Find all existing users
    const existingUsers = await User.findAll();

    // Loop through existing users and add the collection with specific characters
    for (const user of existingUsers) {
      const userId = user.user_id;

      // Check if the user already has a collection, and if not, create one
      const [collection, created] = await user.getCollection({
        include: User,
      });

      if (!collection) {
        await Collection.create({
          user_id: userId,
        });
      }

      // Add specific characters to the user's collection
      await Promise.all(
        CharacterList.filter((character) =>
          specificCharacterIds.includes(character.character_id)
        ).map(async (character) => {
          await collection.addCharacter({
            character_id: character.character_id,
            character_name: character.character_name,
            level: 1, // Set the initial level
            current_xp: 0, // Set the initial XP
            xp_needed: 100, // Set the XP needed to level up
            cost: character.cost,
            rarity: character.rarity,
            description: character.description,
            type: character.type,
            unique_skill: character.unique_skill,
            base_damage: character.base_damage,
            base_health: character.base_health,
            chance_to_hit: character.chance_to_hit,
            crit_chance: character.crit_chance,
            crit_damage: character.crit_damage,
          });
        })
      );

      console.log(`Collection added to user with ID ${userId}`);
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('account')
    .setDescription('Create your economy account or check its balance!'),
  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      // Create or find a user record with a default balance
      const [user, created] = await User.findOrCreate({
        where: { user_id: userId },
        defaults: {
          balance: 730, // Default balance if the user doesn't exist
        },
        include: Collection, // Include the user's collection in the query
      });

      console.log(user.user_id); // User's unique ID
      console.log(user.balance); // User's balance
      console.log(created); // A boolean indicating whether this user was just created

      if (created) {
        console.log(user); // This user record was just created
        return interaction.reply(
          `Your economy account has been created. You have 730 credits in your balance.`
        );
      } else {
        return interaction.reply(
          `You currently have ${user.balance} coins in your account.`
        );
      }
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return interaction.reply('Account already exists.');
      }
      console.error(error);
      return interaction.reply('Something went wrong while creating your account.');
    }
  },
};

// Call the function to add the collection to existing accounts
addCollectionToExistingAccounts();
