'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'GearParts',
      {
        parts_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        type: {
          type: Sequelize.STRING,
        },
        rarity: {
          type: Sequelize.STRING,
        },
      },
      {
        timestamps: false,
      })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('GearParts')
  },
}
