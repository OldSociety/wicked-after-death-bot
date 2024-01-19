'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'StandardLevels',
      {
        level_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        level_name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
      },
      {
        timestamps: false,
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('StandardLevels')
  },
}
