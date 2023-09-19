class MockSlashCommandBuilder {
  constructor() {
    this.setName = jest.fn().mockReturnThis()
    this.setDescription = jest.fn().mockReturnThis()
    this.addUserOption = jest.fn().mockReturnThis()
    this.addSubcommand = jest.fn().mockReturnThis()
  }
}

describe('Your Test Suite', () => {
  let SlashCommandBuilder

  beforeEach(() => {
    jest.mock('@discordjs/builders', () => {
      return {
        SlashCommandBuilder: MockSlashCommandBuilder,
      }
    })
    // Requiring the module after the mock
    SlashCommandBuilder = require('@discordjs/builders').SlashCommandBuilder
  })

  it('should use the mock SlashCommandBuilder', () => {
    const commandBuilder = new SlashCommandBuilder()

    commandBuilder.setName('test')
    commandBuilder.setDescription('testing')

    expect(commandBuilder.setName).toHaveBeenCalledWith('test')
    expect(commandBuilder.setDescription).toHaveBeenCalledWith('testing')
  })
})
