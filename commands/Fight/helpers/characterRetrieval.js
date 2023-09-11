const { Character, MasterCharacter } = require('../../../Models/model')

const retrieveCharacters = async (userId) => {
  const userCharacters = await Character.findAll({
    where: { user_id: userId },
    include: [
      {
        model: MasterCharacter,
        as: 'masterCharacter',
      },
    ],
  })
  return userCharacters
}

module.exports = {
  retrieveCharacters,
}
