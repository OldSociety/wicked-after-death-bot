const { Character } = require('../Models/model')
const LevelUpSystem = require('../commands/Fight/helpers/characterFiles/levelUpSystem')
const maxLevel = 40

// Mock Sequelize's findByPk function
Character.findByPk = jest.fn()
jest.mock('../Models/model')

describe('LevelUpSystem', () => {
  let mockCharacter

  beforeEach(() => {
    jest.clearAllMocks()
    mockCharacter = {
      id: 1,
      level: 1,
      experience: 0,
      xp_needed: 1000,
      effective_health: 100,
      effective_damage: 50,
      save: jest.fn(),
    }
  })

  it('should level up the character when earnedXP is enough', async () => {
    Character.findByPk.mockResolvedValue(mockCharacter)

    await LevelUpSystem.levelUp(1, 1100)

    expect(Character.findByPk).toHaveBeenCalledWith(1)
    expect(mockCharacter.save).toHaveBeenCalledTimes(1)
    expect(mockCharacter.level).toBe(2)
  })

  it('should not level up the character when earnedXP is not enough', async () => {
    Character.findByPk.mockResolvedValue(mockCharacter)

    await LevelUpSystem.levelUp(1, 900)

    expect(Character.findByPk).toHaveBeenCalledWith(1)
    expect(mockCharacter.save).toHaveBeenCalledTimes(0)
    expect(mockCharacter.level).toBe(1)
  })

  it('should throw an error when the character is not found', async () => {
    Character.findByPk.mockResolvedValue(null)

    await expect(LevelUpSystem.levelUp(1, 1000)).rejects.toThrow(
      'Character not found'
    )
  })

  it('should handle maximum level cap', async () => {
    mockCharacter.level = maxLevel
    Character.findByPk.mockResolvedValue(mockCharacter)

    await LevelUpSystem.levelUp(1, 100000)

    expect(Character.findByPk).toHaveBeenCalledWith(1)
    expect(mockCharacter.level).toBe(maxLevel)
  })

  it('should handle multiple level-ups from high earnedXP', async () => {
    Character.findByPk.mockResolvedValue(mockCharacter)

    await LevelUpSystem.levelUp(1, 5000)

    expect(Character.findByPk).toHaveBeenCalledWith(1)
    expect(mockCharacter.level).toBeGreaterThan(1) // Adjust this based on your logic
  })

  it('should handle characters with different initial levels', async () => {
    mockCharacter.level = 10
    mockCharacter.experience = 51000 // Set the appropriate starting XP

    Character.findByPk.mockResolvedValue(mockCharacter)

    await LevelUpSystem.levelUp(1, 15000)

    expect(Character.findByPk).toHaveBeenCalledWith(1)
    expect(mockCharacter.level).toBeGreaterThan(10) // Adjust this based on your logic
  })

  it('should not level down from negative earnedXP', async () => {
    Character.findByPk.mockResolvedValue(mockCharacter)

    await LevelUpSystem.levelUp(1, -500)

    expect(Character.findByPk).toHaveBeenCalledWith(1)
    expect(mockCharacter.level).toBe(1)
  })

  it('should properly adjust health and damage stats', async () => {
    Character.findByPk.mockResolvedValue(mockCharacter)

    await LevelUpSystem.levelUp(1, 1000)

    expect(Character.findByPk).toHaveBeenCalledWith(1)
    expect(mockCharacter.effective_health).toBe(120) // Assuming a 1.2x multiplier
    expect(mockCharacter.effective_damage).toBe(60) // Assuming a 1.2x multiplier
  })
})
