# Discord Emoji Downloader

A TypeScript-based tool to download and process emojis from Discord servers using Puppeteer. This script logs into Discord, navigates to specified servers and channels, extracts emoji URLs, downloads the emojis, resizes them, and saves them as `.webp` files in a structured directory.

## Features

- **Automated Login**: Logs into Discord using provided credentials, with support for 2FA.
- **Server-Specific Emoji Extraction**: Extracts emojis from specified Discord servers.
- **Image Processing**: Resizes emojis to a configurable size and converts them to `.webp` format using `sharp`.
- **Structured Output**: Saves emojis in server-specific folders (e.g., `emojis/Cozyhive/emoji_1.webp`).
- **Environment Variables**: Configurable via a `.env` file for credentials, servers, and other settings.
- **Error Handling**: Gracefully handles errors during emoji downloading and processing.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh/) (JavaScript runtime and package manager)
- [Node.js](https://nodejs.org/) (required for Puppeteer dependencies)
- A Discord account with access to the servers you want to scrape emojis from

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/username/discord-emoji-downloader.git
   cd discord-emoji-downloader
   ```

2. **Install Dependencies**:
   Use Bun to install the required packages:

   ```bash
   bun install
   ```

3. **Set Up Environment Variables**:
   Copy the `.env.example` file to `.env` and fill in your Discord credentials and server configurations:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your details (see [Environment Variables](#environment-variables) for more information).

## Usage

1. **Run the Script**:
   Execute the script using Bun:

   ```bash
   bun run start
   ```

   - By default, the script runs in **non-headless mode** (a browser window will open). To run in headless mode, modify `index.ts` and set `headless: true` in the `puppeteer.launch` options.
   - The script will log into Discord, navigate to each specified server and channel, extract emojis, and save them to the `emojis` directory.

2. **Check the Output**:

   - Emojis are saved in the `emojis` directory, organized by server (e.g., `emojis/Cozyhive/emoji_1.webp`, `emojis/Online_Hub/emoji_2.webp`).
   - The script logs progress to the console, including the number of emojis found and any errors encountered.

3. **TypeScript Type Checking** (Optional):
   To ensure there are no TypeScript errors:
   ```bash
   bun run typecheck
   ```

## Environment Variables

The project uses a `.env` file to manage configuration. Below are the required and optional environment variables:

| Variable                        | Description                                                                                                              | Default Value                          | Required |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | -------- |
| `DISCORD_EMAIL`                 | Your Discord email address.                                                                                              | None                                   | Yes      |
| `DISCORD_PASSWORD`              | Your Discord password.                                                                                                   | None                                   | Yes      |
| `SERVERS`                       | A JSON array of server objects (e.g., `[{ "name": "ServerName", "folder": "ServerFolder", "channel": "ChannelName" }]`). | None                                   | Yes      |
| `OUTPUT_BASE_DIR`               | The directory where emojis will be saved.                                                                                | `emojis`                               | No       |
| `EMOJI_SIZE`                    | The size to resize emojis to (width and height).                                                                         | `512`                                  | No       |
| `DISCORD_2FA_SELECTOR`          | The placeholder text for the 2FA input field.                                                                            | `código de autenticación de 6 dígitos` | No       |
| `DISCORD_EMOJI_BUTTON_SELECTOR` | The aria-label for the emoji picker button.                                                                              | `Seleccionar emojis`                   | No       |

### Example `.env` File

```env
# Discord Credentials
DISCORD_EMAIL="your-email@example.com"
DISCORD_PASSWORD="your-password"

# Servers (JSON string)
SERVERS='[
  { "name": "Cozyhive", "folder": "Cozyhive", "channel": "general" },
  { "name": "Online Hub 🍃", "folder": "Online_Hub", "channel": "☕・lounge" }
]'

# Output Directory (relative to the project root)
OUTPUT_BASE_DIR="emojis"

# Emoji Size
EMOJI_SIZE=512

# Discord Selectors
DISCORD_2FA_SELECTOR="código de autenticación de 6 dígitos"
DISCORD_EMOJI_BUTTON_SELECTOR="Seleccionar emojis"
```

## Project Structure

```
discord-emoji-downloader/
├── src/
│   ├── config.ts              # Configuration for output directory and settings
│   ├── discord.ts             # Functions for Discord interactions (login, navigation, etc.)
│   ├── emoji-processor.ts     # Functions for extracting and processing emojis
│   ├── env.ts                 # Environment variable loading and validation
│   ├── index.ts               # Main script to orchestrate the emoji downloading process
│   ├── types/                 # TypeScript type definitions
│   │   ├── emoji-processor-config.ts
│   │   ├── env-config.ts
│   │   ├── index.ts
│   │   └── server.ts
│   └── utils.ts               # Utility functions (delay, 2FA prompt)
├── .env.example               # Example environment variable file
├── .gitignore                 # Git ignore file
├── package.json               # Project dependencies and scripts
├── README.md                  # Project documentation (this file)
└── tsconfig.json              # TypeScript configuration
```

## How It Works

1. **Initialization**:

   - The script checks if the `emojis` directory exists. If not, it creates it.
   - It creates a subdirectory for each server.

2. **Discord Interaction**:

   - Logs into Discord using the provided email and password.
   - Handles 2FA if enabled, prompting the user for a 2FA code.
   - Navigates to each specified server and channel.

3. **Emoji Extraction**:

   - Opens the emoji picker and switches to the server-specific emoji tab.
   - Scrolls through the emoji picker to load all emojis and extracts their URLs.

4. **Emoji Processing**:

   - Downloads each emoji from its URL.
   - Resizes the emoji to the specified size (default: 512px) using `sharp`.
   - Converts the emoji to `.webp` format.
   - Saves the processed emoji to the server-specific folder.

5. **Cleanup**:
   - Closes the emoji picker and moves to the next server.
   - Closes the browser when all servers are processed.

## Troubleshooting

- **Login Fails**:

  - Ensure your `DISCORD_EMAIL` and `DISCORD_PASSWORD` are correct in the `.env` file.
  - If 2FA is enabled, make sure you can provide the 2FA code when prompted.

- **Server or Channel Not Found**:

  - Verify that the server and channel names in the `SERVERS` array match the exact names in Discord (case-sensitive).
  - Check if you have access to the server and channel with the Discord account you’re using.

- **Emojis Not Downloading**:

  - Ensure the Discord selectors (`DISCORD_2FA_SELECTOR`, `DISCORD_EMOJI_BUTTON_SELECTOR`) match the current Discord UI. You may need to update them if Discord changes its layout.
  - Check the console logs for errors during emoji downloading or processing.

- **File System Errors**:

  - Ensure you have write permissions in the project directory.
  - Verify that the `OUTPUT_BASE_DIR` path is valid and accessible.

- **TypeScript Errors**:
  - Run `bun run typecheck` to check for TypeScript errors.
  - If Bun has trouble running the TypeScript code, compile to JavaScript and run the compiled code:
    ```bash
    bun tsc
    bun dist/index.js
    ```

## Contributing

Contributions are welcome! If you’d like to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit them (`git commit -m "Add your feature"`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please ensure your code follows the project’s coding style.

## Acknowledgments

- [Puppeteer](https://pptr.dev/) for browser automation.
- [Sharp](https://sharp.pixelplumbing.com/) for image processing.
- [Bun](https://bun.sh/) for a fast JavaScript runtime and package manager.
- The Discord community for inspiration.

