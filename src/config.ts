import { env } from './env'
import type { EmojiProcessorConfig } from './types'

// Base folder for all emojis
export const OUTPUT_BASE_DIR: string = process.cwd() + '/' + env.outputBaseDir

export const config: EmojiProcessorConfig = {
	discordEmail: env.discordEmail,
	discordPassword: env.discordPassword,
	servers: env.servers,
	outputBaseDir: OUTPUT_BASE_DIR,
	emojiSize: env.emojiSize
}
