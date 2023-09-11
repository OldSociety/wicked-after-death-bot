module.exports = (sequelize, DataTypes) => {
	return sequelize.define('gear', {
		name: {
			type: DataTypes.STRING,
			unique: true,
		},
		cost: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
        
	}, {
		timestamps: false,
	});
};