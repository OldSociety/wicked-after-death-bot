const {
  SlashCommandBuilder,
} = require('discord.js');
const { DataTypes } = require('sequelize');
const sequelize = require('../../Utils/sequelize');
const User = require('../../Models/User')(sequelize, DataTypes);
const Collection = require('../../Models/Collection')(sequelize, DataTypes);
const CharacterList = require('../../db/dbCharacters'); // Import your character data

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
      });

      console.log(user.user_id); // User's unique ID
      console.log(user.balance); // User's balance
      console.log(created); // A boolean indicating whether this user was just created

      if (created) {
        console.log(user); // This user record was just created

        // Create the initial collection of characters for the user
        await Promise.all(CharacterList.map(async (character) => {
          await Collection.create({
            user_id: userId,
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
        }));

        return interaction.reply(
          `Your economy account has been created. You have 730 credits in your balance, and you've received your initial collection of characters.`
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