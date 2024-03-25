'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'Decks',
      {
        deck_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        deck_name: {
          type: Sequelize.STRING,
          unique: true,
          allowNull: false,
        }
      }
    ); 
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Decks');
  },
};