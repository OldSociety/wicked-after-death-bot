'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the createdAt and updatedAt columns
    // await queryInterface.removeColumn('Enemies', 'createdAt');
    // await queryInterface.removeColumn('Enemies', 'updatedAt');
  },

  async down(queryInterface, Sequelize) {
    // Add the createdAt and updatedAt columns back if you need to rollback
    // await queryInterface.addColumn('Enemies', 'createdAt', {
    //   type: Sequelize.DATE,
    //   allowNull: false,
    //   defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    // });
    // await queryInterface.addColumn('Enemies', 'updatedAt', {
    //   type: Sequelize.DATE,
    //   allowNull: false,
    //   defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    // });
  }
};
