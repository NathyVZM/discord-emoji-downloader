import type { EnvConfig } from './types'

// Load environment variables using Bun's native support
const env: EnvConfig = {
	discordEmail: Bun.env.DISCORD_EMAIL ?? '',
	discordPassword: Bun.env.DISCORD_PASSWORD ?? '',
	servers: Bun.env.SERVERS ? JSON.parse(Bun.env.SERVERS) : [],
	outputBaseDir: Bun.env.OUTPUT_BASE_DIR ?? 'emojis',
	emojiSize: Bun.env.EMOJI_SIZE ? Number.parseInt(Bun.env.EMOJI_SIZE, 10) : 512,
	discord2FASelector: Bun.env.DISCORD_2FA_SELECTOR ?? 'código de autenticación de 6 dígitos',
	discordEmojiButtonSelector: Bun.env.DISCORD_EMOJI_BUTTON_SELECTOR ?? 'Seleccionar emojis'
}

// Validate required environment variables
if (!env.discordEmail) {
	throw new Error('DISCORD_EMAIL is required in .env file')
}
if (!env.discordPassword) {
	throw new Error('DISCORD_PASSWORD is required in .env file')
}
if (!env.servers.length) {
	throw new Error('SERVERS is required in .env file and must be a valid JSON array')
}

export { env }
