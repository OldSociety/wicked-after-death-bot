'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // await queryInterface.addColumn('Characters', 'in_deck', {
    //   type: Sequelize.BOOLEAN,
    //   defaultValue: false,
    //   allowNull: false
    // });
  },

  down: async (queryInterface, Sequelize) => {
    // await queryInterface.removeColumn('Characters', 'in_deck');
  }
};
