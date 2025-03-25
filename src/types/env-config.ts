import type { Server } from './server'

export interface EnvConfig {
	/**
	 * The email address used for Discord login.
	 */
	discordEmail: string
	/**
	 * The password used for Discord login.
	 */
	discordPassword: string
	/**
	 * An array of server configurations.
	 */
	servers: Server[]
	/**
	 * The base directory for output files.
	 */
	outputBaseDir: string
	/**
	 * The size of the emojis to be used.
	 */
	emojiSize: number
	/**
	 * The CSS selector for the Discord 2FA input.
	 */
	discord2FASelector: string
	/**
	 * The CSS selector for the Discord emoji button.
	 */
	discordEmojiButtonSelector: string
}
