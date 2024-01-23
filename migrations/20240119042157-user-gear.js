'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'UserGears',
      {
        character_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
        },
        gear_id: {
          type: Sequelize.INTEGER,
        },
        name: {
          type: Sequelize.STRING,
          unique: true,
        },
        rarity: {
          type: Sequelize.INTEGER,
        },
        level: {
          type: Sequelize.INTEGER,
          defaultValue: 1,
        },
        ability: {
          type: Sequelize.STRING,
        },
      },
      {
        timestamps: false,
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserGears')
  },
}
