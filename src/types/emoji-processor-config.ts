import type { Server } from './server'

/**
 * Configuration interface for the Emoji Processor.
 * @interface EmojiProcessorConfig
 */
export interface EmojiProcessorConfig {
	/**
	 * The email address used to log in to Discord.
	 */
	discordEmail: string
	/**
	 * The password used to log in to Discord.
	 */
	discordPassword: string
	/**
	 * An array of server configurations to process emojis from.
	 */
	servers: Server[]
	/**
	 * The base directory where processed emojis will be saved.
	 */
	outputBaseDir: string
	/**
	 * The size of the emojis to be processed.
	 */
	emojiSize: number
}
