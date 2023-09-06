module.exports = (sequelize, DataTypes) => {
	return sequelize.define('collection', {
		user_id: DataTypes.STRING,
		card_id: DataTypes.INTEGER,
	}, {
		timestamps: false,
	});
};