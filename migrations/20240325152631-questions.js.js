'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Questions', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      deck_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      question_text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      answer_1: Sequelize.STRING,
      answer_2: Sequelize.STRING,
      answer_3: Sequelize.STRING,
      answer_4: Sequelize.STRING,
      correct_answer: Sequelize.STRING, // e.g., "A", "B", "C", or "D"
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Questions')
  },
}
