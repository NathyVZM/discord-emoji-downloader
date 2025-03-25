import sharp from 'sharp'
import path from 'path'
import { Page } from 'puppeteer'
import type { Server } from './types'
import type { BunFile } from 'bun'

/**
 * Extracts the URLs of emojis from a Discord server's emoji picker using Puppeteer.
 *
 * @param {Page} page - The Puppeteer page instance to interact with.
 * @param {string} serverName - The name of the Discord server to extract emojis from.
 * @returns {Promise<string>} A promise that resolves to an array of emoji URLs.
 *
 * @throws Will throw an error if the emoji picker container or server emoji section is not found.
 *
 * The function performs the following steps:
 * 1. Finds the scrollable container for the emoji picker.
 * 2. Finds the server emojis section within the emoji picker.
 * 3. Iteratively scrolls through the emoji picker to load all emojis.
 * 4. Collects the URLs of all visible emojis, ensuring no duplicates.
 * 5. Stops scrolling when no new emojis are loaded after 3 consecutive scrolls or when reaching the next category section.
 *
 * The URLs are modified to request the emojis in high quality (size=512) and preserve the animated flag if present.
 */
export const extractEmojiUrls = async (page: Page, serverName: string): Promise<string[]> => {
	console.log('Extracting emoji URLs...')
	return await page.evaluate(async (): Promise<string[]> => {
		// Find the scrollable container for the emoji picker
		const emojiPickerContainer: HTMLElement | null = document.querySelector(
			'div[class*="emojiPicker"] div[class*="scroller"]'
		)
		if (!emojiPickerContainer) {
			throw new Error('Emoji picker container not found')
		}

		// Find the server emojis section (the first categorySection_c656ac after clicking the server tab)
		const serverEmojiSection: HTMLElement | null = document.querySelector(
			'div[class*="emojiPicker"] div[class*="categorySection"]'
		)
		if (!serverEmojiSection) {
			throw new Error('Server emoji section not found')
		}

		const urls: Set<string> = new Set() // Use a Set to avoid duplicates
		let previousEmojiCount: number = 0
		let scrollAttempts: number = 0
		const maxScrollAttempts: number = 50 // Maximum number of scroll attempts to prevent infinite loop
		const scrollIncrement: number = 200 // Scroll by 200px at a time to load more emojis gradually
		let noNewEmojisCount: number = 0 // Counter for consecutive scrolls with no new emojis

		while (scrollAttempts < maxScrollAttempts) {
			// Get all currently visible emojis within the server emoji section
			const emojis: NodeListOf<HTMLImageElement> = serverEmojiSection.querySelectorAll(
				'img[src*="cdn.discordapp.com/emojis"]'
			)
			emojis.forEach((emoji: HTMLImageElement) => {
				let src: string = emoji.src
				// Check if the emoji is animated (contains animated=true)
				const isAnimated: boolean = src.includes('animated=true')
				// Modify the URL to request the emoji in high quality (size=512)
				src = src.replace(/size=\d+/, 'size=512')
				// Ensure the animated=true flag is preserved if present
				if (isAnimated && !src.includes('animated=true')) {
					src += '&animated=true'
				}
				urls.add(src) // Add to Set to avoid duplicates
			})

			const currentEmojiCount: number = urls.size
			console.log(`Scroll attempt ${scrollAttempts + 1}: Found ${currentEmojiCount} emojis so far`)

			// Check if we've reached the end of the server emojis section
			const nextSection: Element | null = serverEmojiSection.nextElementSibling
			if (nextSection && nextSection.classList.contains('categorySection_c656ac')) {
				console.log('Reached the next category section, stopping scroll')
				break
			}

			// Check if new emojis were loaded
			if (currentEmojiCount === previousEmojiCount) {
				noNewEmojisCount++
				if (noNewEmojisCount >= 3) {
					// If no new emojis are loaded after 3 consecutive scrolls, assume we've reached the end
					console.log('No new emojis loaded after 3 attempts, stopping scroll')
					break
				}
			} else {
				noNewEmojisCount = 0 // Reset the counter if new emojis were found
			}

			// Scroll the emoji picker container by a small increment
			emojiPickerContainer.scrollTo(0, emojiPickerContainer.scrollTop + scrollIncrement)

			// Wait for new emojis to load
			const { promise, resolve } = Promise.withResolvers<void>()
			setTimeout(resolve, 1500)
			await promise

			previousEmojiCount = currentEmojiCount
			scrollAttempts++
		}

		return Array.from(urls) // Convert Set back to Array
	}, serverName)
}

/**
 * Downloads, processes, and saves a list of emojis from given URLs.
 *
 * @param {string[]} emojiUrls - An array of URLs pointing to the emoji images to be downloaded.
 * @param {Server} server - The server object containing server-specific information such as folder and name.
 * @param {string} outputBaseDir - The base directory where the processed emojis will be saved.
 * @param {number} emojiSize - The desired size (width and height) for the resized emojis.
 * @returns {Promise<void>} A promise that resolves when all emojis have been processed and saved.
 *
 * The function performs the following steps for each emoji URL:
 * 1. Downloads the emoji image from the URL.
 * 2. Converts the downloaded image to a buffer.
 * 3. Resizes and converts the image to .webp format using the `sharp` library.
 * 4. Saves the processed image to a server-specific folder.
 * 5. Verifies that the file was saved correctly by checking its size on disk.
 *
 * If any step fails, an error message is logged to the console.
 */
export const downloadAndProcessEmojis = async (
	emojiUrls: string[],
	server: Server,
	outputBaseDir: string,
	emojiSize: number
): Promise<void> => {
	for (const [index, url] of emojiUrls.entries()) {
		console.log(`Downloading emoji ${index + 1}/${emojiUrls.length} from URL: ${url}...`)

		try {
			// Download the emoji using Bun's fetch
			const response: Response = await fetch(url)
			if (!response.ok) {
				throw new Error(`Failed to fetch emoji: ${response.statusText}`)
			}

			const buffer: Buffer = Buffer.from(await response.arrayBuffer())
			console.log(`Downloaded emoji ${index + 1}, buffer size: ${buffer.length} bytes`)

			// Check if the buffer is empty
			if (buffer.length === 0) {
				throw new Error('Downloaded buffer is empty')
			}

			// Resize and convert to .webp using sharp
			const resizedImage: Buffer = await sharp(buffer, { animated: url.includes('animated=true') })
				.resize({
					width: emojiSize,
					height: emojiSize,
					fit: 'inside', // Ensure one side is 512px, the other can be <= 512px
					withoutEnlargement: true // Don't upscale smaller images
				})
				.webp({ quality: 80 }) // Convert to .webp with good quality
				.toBuffer()

			console.log(`Processed emoji ${index + 1}, resized buffer size: ${resizedImage.length} bytes`)

			// Check if the resized buffer is empty
			if (resizedImage.length === 0) {
				throw new Error('Resized buffer is empty')
			}

			// Save the image to the server-specific folder using Bun.write
			const fileName: string = `emoji_${index + 1}.webp`
			const filePath: string = path.join(outputBaseDir, server.folder, fileName)
			await Bun.write(filePath, resizedImage)
			console.log(`Saved ${fileName} to ${server.folder}`)

			// Verify the file was saved correctly using Bun.file
			const file: BunFile = Bun.file(filePath)
			const fileSize: number = (await file.arrayBuffer()).byteLength
			console.log(`File size on disk: ${fileSize} bytes`)
		} catch (err) {
			console.error(`Failed to process emoji ${index + 1} in ${server.name}:`, (err as Error).message)
		}
	}
}
