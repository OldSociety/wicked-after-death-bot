'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserCardCollections', {
      user_id: {
        type: Sequelize.STRING,
        references: {
          model: 'Users',
          key: 'user_id',
        },
        allowNull: false,
      },
      deck_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Decks',
          key: 'id',
        },
        allowNull: false,
      },
      card_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Cards',
          key: 'id',
        },
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    })

    // Example of how to add an index in a migration
    await queryInterface.addIndex('UserCardCollections', ['user_id'], {
      name: 'idx_user_id',
    })

    await queryInterface.addIndex('UserCardCollections', ['card_id'], {
      name: 'idx_card_id',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserCardCollections')
  },
}
