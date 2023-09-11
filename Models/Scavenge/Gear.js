module.exports = (sequelize, DataTypes) => {
	return sequelize.define('gear', {
		gear_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
          },
		gear_rarity: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
        ability: {
            type: DataTypes.STRING,
			allowNull: true
        },
        gear_set: {
            type: DataTypes.STRING,
            allowNull: true
        }
	}, {
		timestamps: false,
	});
};