'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WickedCards', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      card_index: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      card_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      rarity: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      img_url: {
        type: Sequelize.STRING,
        allowNull: true, 
        validate: {
          isUrl: true, // Ensure it's a valid URL
        },
      },
      album_category: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      collection_category: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cost: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0, 
      },
      damage_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0, 
      },
      question_text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      answer_1: Sequelize.STRING,
      answer_2: Sequelize.STRING,
      answer_3: Sequelize.STRING,
      answer_4: Sequelize.STRING,
      correct_answer: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('WickedCards')
  },
}
