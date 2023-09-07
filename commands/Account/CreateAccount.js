const { SlashCommandBuilder } = require('discord.js');
const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../../Utils/sequelize');
const User = require('../../Models/User')(sequelize, DataTypes);
const Collection = require('../../Models/Collection')(sequelize, DataTypes);
const CharacterList = require('../../db/dbCharacters');

const specificCharacterIds = [0, 1, 2];

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('create')
    .setDescription('Create your economy account'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const t = await sequelize.transaction(); // Initialize transaction

    try {
      const [user, created] = await User.findOrCreate({
        where: { user_id: userId },
        defaults: {
          balance: 730,
        },
        include: [{ model: Collection, as: 'collections' }], // Explicit include
        transaction: t, // Add transaction
      });

      if (created) {
        await Promise.all(specificCharacterIds.map((id) => {
          const character = CharacterList.find(c => c.character_id === id);
          return Collection.create({
            user_id: userId,
            character_id: id,
            character_name: character.character_name,
            experience: 0,
          }, { transaction: t });
        }));
        
        await t.commit(); // Commit transaction

        return interaction.reply(
          `Your economy account has been created. You have 730 credits in your balance.`
        );
      } else {
        await t.rollback(); // Rollback transaction
        return interaction.reply(
          `You already have an account. You currently have ${user.balance} coins in your account.`
        );
      }
    } catch (error) {
      await t.rollback(); // Rollback transaction in case of error
      console.error('Error in execute:', error);
      return interaction.reply('Something went wrong while creating your account.');
    }
  },
};
