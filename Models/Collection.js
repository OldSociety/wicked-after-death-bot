module.exports = (sequelize, DataTypes) => {
	const Collection = sequelize.define('Collection', {
	  collection_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true,
	  },
	  user_id: {
		type: DataTypes.STRING,
		allowNull: false,
	  },
	  // ... any other attributes specific to the collection itself
	}, {
	  timestamps: false,
	});
  
	return Collection;
  };
  