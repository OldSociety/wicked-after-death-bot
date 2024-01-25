'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    module.exports = (sequelize, DataTypes) => {
      const Tag = sequelize.define('Tag', {
        name: Sequelize.STRING,
      })

      return Tag
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tag')
  },
}
