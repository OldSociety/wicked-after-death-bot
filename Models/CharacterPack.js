module.exports = (sequelize, DataTypes) => {
	return sequelize.define('character_pack', {
		name: {
			type: DataTypes.STRING,
			unique: true,
		},
		cost: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		rarity: {
			type: DataTypes.STRING,
			allowNull: false,
		}
	}, {
		timestamps: false,
	});
};