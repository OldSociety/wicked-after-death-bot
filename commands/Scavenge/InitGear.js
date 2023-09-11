const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../../Utils/sequelize');
const { User, UserGear } = require('../../Models/model.js');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('initgear')
    .setDescription('Initialize gear for a user')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to initialize gear for')
        .setRequired(true)),
  async execute(interaction) {
    const targetUserId = interaction.options.getUser('target').id;
    const t = await sequelize.transaction();

    try {
      const user = await User.findOne({
        where: { user_id: targetUserId },
        transaction: t,
      });

      if (!user) {
        await t.rollback();
        return interaction.reply(`The selected user doesn't have an account yet. They need to create one first.`);
      }

      const [userGear, created] = await UserGear.findOrCreate({
        where: { user_id: targetUserId },
        // Add any other initialization fields here
        transaction: t,
      });

      if (created) {
        await t.commit();
        return interaction.reply(`Gear for the selected user has been initialized.`);
      } else {
        await t.rollback();
        return interaction.reply('The selected user already has initialized gear.');
      }
    } catch (error) {
      await t.rollback();
      console.error('Error in execute:', error);
      return interaction.reply('Something went wrong while initializing gear.');
    }
  },
};
