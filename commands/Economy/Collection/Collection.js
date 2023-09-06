const { SlashCommandBuilder } = require('@discordjs/builders')
const { DataTypes } = require('sequelize')
const sequelize = require('../../Utils/sequelize')
const User = require('../../Models/User')(sequelize, DataTypes)

const CharacterCard = require('../../../Models/Character')(sequelize, DataTypes)


CharacterCard.findAll()
  .then((cards) => {
    console.log('All cards:', cards);
  })
  .catch((err) => {
    console.error('Error retrieving cards:', err);
  });