# Wicked After Death Bot

![Artwork](https://github.com/brainboxdotcc/ssod/blob/main/resource/app_encyclopaedia.jpg)

Wicked After Death is an fighting and economy text game, where you can collect heroes and use them to fight the horrors of the apocalypse. Users can create accounts and check their balances. It is built using Discord.js, sqlite3, and sequelize.

### Timeline of the game's development

- **1993**: This game was created by me at age 13 as a 1480 paragraph novel, similar in inspiration to "[Fighting Fantasy](https://en.wikipedia.org/wiki/Fighting_Fantasy)" books by Steve Jackson and Ian Livingstone.
- **1996**: The game book was typed up into [inter-word](https://en.wikipedia.org/wiki/Wordwise#InterWord) on BBC Master 128 Computer
- **2000**: The game book content was transcribed into Microsoft Word 98
- **2001**: Word 98 content converted to a web based game, completely single player. C++ backend.
- **2003**: Multiplayer features added to the game. [ssod.org](ssod.org) doman name registered. Peak player count in 2005 was 1500 concurrent players.
- **2014**: Start of development of a 3D single player Seven Spells game in Unreal Engine 4
- **2020**: Unreal Engine 4 game abandoned due to lack of resources to adapt the content to a fully open 3D world.
- **2023**: New parser/engine created for the 2004 game content to run via Discord through a bot.

## Features

- **Account Creation**: Users can create accounts using '/account'.

- **Check Balance**: Users can check their account balance at any time.

- **ADMIN ID**: New users are assigned ids tied to their usernames. You can add users as admins by adding their ids to .env file.

## Installation

1. Clone this repository to your local machine.

2. Install the required dependencies using npm:

   ```bash
   npm install
   mkdir build
   cd build
   cmake ..
   make -j
   ```

## Deploy new commands
```bash
   node deploy-commands.js
   ```

## Configuring the bot

Create a config.json in the directory above the build directory.

__NOTE__: It is __EXTREMELY IMPORTANT__ to create secure IV/key values for the encryption. This is used to encrypt the state content sent to the user, and if an insecure configuration is placed into the config file here, it may allow selfbots and malicious users to tamper with game state. Keep these values secure and keep them secret as your token, for your the protection of the bot!

```json
{
	"token": "token goes here", 
	"log": "log path goes here",
	"database": {
		"host": "localhost",
		"username": "mysql username",
		"password": "mysql password",
		"database": "mysql database",
		"port": 3306
	},
	"encryption": {
		"iv": "16 character AES256 IV",
		"key": "32 character AES256 symmetric key",
	},
	"botlists": {
		"top.gg": {
			"token": "top.gg bot list token"
		},
		"other compatible bot list": {
			"token": "their token..."
		}
	}
}
```

## Starting the bot

```bash
cd ssod
screen -dmS ssod ./run.sh
```
