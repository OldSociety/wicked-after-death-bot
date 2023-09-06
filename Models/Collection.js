module.exports = (sequelize, DataTypes) => {
	const Collection = sequelize.define('Collection', {
	  user_id: DataTypes.STRING,
	  card_id: DataTypes.INTEGER,
	}, {
	  timestamps: false,
	});
  
	Collection.associate = (models) => {
	  Collection.belongsTo(models.User, {
		foreignKey: 'user_id',
		onDelete: 'CASCADE',
	  });
	};
  
	return Collection;
  };
  