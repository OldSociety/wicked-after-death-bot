const { SlashCommandBuilder } = require('discord.js');
const { DataTypes } = require('sequelize');
const sequelize = require('../../Utils/sequelize');
const User = require('../../Models/User')(sequelize, DataTypes);
const Collection = require('../../Models/Collection')(sequelize, DataTypes);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('collection')
    .setDescription('View the characters in your collection'),

  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      const user = await User.findOne({
        where: { user_id: userId },
        include: [{ model: Collection, as: 'collections' }], // Explicit include
      });

      if (!user) {
        return interaction.reply('You do not have an account.');
      }

      const collection = user.collections || [];

      if (collection.length === 0) {
        return interaction.reply('Your collection is empty.');
      }

      const collectionList = collection.map((item) => `${item.character_name}`);
      return interaction.reply(`Your collection:\n${collectionList.join('\n')}`);
    } catch (error) {
      console.error(error);
      return interaction.reply('Something went wrong while retrieving your collection.');
    }
  },
};
