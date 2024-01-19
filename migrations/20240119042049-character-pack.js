'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CharacterPacks', {
      name: {
        type: Sequelize.STRING,
        unique: true,
      },
      cost: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      rarity: {
        type: Sequelize.STRING,
        allowNull: false,
      }
    }, {
      timestamps: false,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CharacterPacks')
  },
}
