module.exports = (sequelize, DataTypes) => {
	const Collection = sequelize.define('collection', {
	  user_id: DataTypes.STRING,
	  character_id: DataTypes.INTEGER,
	  level: {
		type: DataTypes.INTEGER,
		allowNull: false,
	  },
	  current_xp: {
		type: DataTypes.INTEGER,
		allowNull: false,
	  },
	  xp_needed: {
		type: DataTypes.INTEGER,
		allowNull: false,
	  },
	  // other attributes that are unique to each player's instance of a character
	}, {
	  timestamps: false,
	});
  
	return Collection;
  };