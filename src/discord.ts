import { Page } from 'puppeteer'
import { env } from './env'
import { delay, promptFor2FACode } from './utils'

/**
 * Logs in to Discord using the provided email and password.
 *
 * @param {Page} page - The Puppeteer page instance to interact with.
 * @param {string} email - The email address to use for logging in.
 * @param {string} password - The password to use for logging in.
 * @returns {Promise<void>} A promise that resolves when the login process is complete.
 */
export const loginToDiscord = async (page: Page, email: string, password: string): Promise<void> => {
	console.log('Logging in to Discord...')
	await page.goto('https://discord.com/login', { waitUntil: 'networkidle2' })

	// Enter email and password
	await page.type('input[name="email"]', email)
	await page.type('input[name="password"]', password)
	await page.click('button[type="submit"]')
}

/**
 * Handles the Two-Factor Authentication (2FA) process for a Discord login page.
 *
 * This function checks if a 2FA prompt is visible on the page. If the prompt is detected,
 * it prompts the user to enter the 2FA code from their authenticator app, enters the code
 * into the input field, and submits the form. If no 2FA prompt is detected, it proceeds
 * without entering a 2FA code.
 *
 * @param {Page} page - The Puppeteer Page object representing the Discord login page.
 * @returns {Promise<void>} A promise that resolves when the login process is complete.
 */
export const handle2FA = async (page: Page): Promise<void> => {
	console.log('Checking for 2FA prompt...')
	const is2FAPromptVisible: boolean = await page
		.waitForSelector(`input[placeholder="${env.discord2FASelector}"]`, { timeout: 50000 })
		.then(() => true)
		.catch(() => false)

	if (is2FAPromptVisible) {
		console.log('2FA prompt detected! Please check your authenticator app.')
		const twoFACode: string = await promptFor2FACode() // Use Bun's prompt
		console.log('Entering 2FA code...')

		// Enter the 2FA code
		await page.type(`input[placeholder="${env.discord2FASelector}"]`, twoFACode)
		await page.click('button[type="submit"]') // Submit the 2FA form
	} else {
		console.log('No 2FA prompt detected. Proceeding...')
	}

	// Wait for navigation after login
	await page.waitForNavigation({ waitUntil: 'networkidle2' })
	console.log('Logged in successfully!')
}

/**
 * Navigates to a specified Discord server by its name.
 *
 * @param page - The Puppeteer Page object representing the browser page.
 * @param serverName - The name of the Discord server to navigate to.
 * @returns A promise that resolves when the navigation is complete.
 *
 * @remarks
 * This function waits for the server element to appear on the page, scrolls to it if necessary,
 * and then clicks on it to navigate. It includes delays to ensure that scrolling and navigation
 * actions are completed.
 *
 * @example
 * ```typescript
 * await navigateToServer(page, "My Discord Server");
 * ```
 */
export const navigateToServer = async (page: Page, serverName: string): Promise<void> => {
	console.log(`Navigating to server: ${serverName}...`)
	const serverSelector: string = `div[aria-label*="${serverName}"][role="treeitem"]`
	await page.waitForSelector(serverSelector, { timeout: 30000 })

	// Scroll to the server if necessary
	await page.evaluate((selector: string) => {
		const element: HTMLElement | null = document.querySelector(selector)
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'center' })
		}
	}, serverSelector)

	await delay(1000) // Wait for scrolling to complete
	await page.click(serverSelector)
	await delay(2000) // Wait for the server to load
}

/**
 * Navigates to a specified channel within a given server on Discord.
 *
 * @param {Page} page - The Puppeteer Page object representing the browser page.
 * @param {string} serverName - The name of the server containing the channel.
 * @param {string} channelName - The name of the channel to navigate to.
 * @returns {Promise<void>} A promise that resolves when the navigation is complete.
 *
 * @example
 * ```typescript
 * await navigateToChannel(page, 'My Server', 'general');
 * ```
 */
export const navigateToChannel = async (page: Page, serverName: string, channelName: string): Promise<void> => {
	console.log(`Navigating to channel: ${channelName} in ${serverName}...`)
	const channelSelector: string = `li[data-dnd-name="${channelName}"]`
	await page.waitForSelector(channelSelector, { timeout: 10000 })

	// Scroll to the channel if necessary
	await page.evaluate((selector: string) => {
		const element: HTMLElement | null = document.querySelector(selector)
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'center' })
		}
	}, channelSelector)

	await delay(1000) // Wait for scrolling to complete
	await page.click(channelSelector)
	await delay(2000) // Wait for the channel to load
}

/**
 * Opens the emoji picker in Discord and switches to the server-specific emoji tab.
 *
 * @param {Page} page - The Puppeteer page instance.
 * @param {string} serverName - The name of the server whose emoji tab should be selected.
 * @returns {Promise<string>} - A promise that resolves to the selector string for the emoji picker button.
 *
 * @example
 * ```typescript
 * const selector = await openEmojiPicker(page, 'My Server');
 * console.log(`Emoji picker opened, selector: ${selector}`);
 * ```
 */
export const openEmojiPicker = async (page: Page, serverName: string): Promise<string> => {
	console.log('Opening emoji picker...')
	await page.waitForSelector(`button[aria-label="${env.discordEmojiButtonSelector}"]`, { timeout: 10000 })
	await page.click(`button[aria-label="${env.discordEmojiButtonSelector}"]`)
	await delay(2000) // Wait for the emoji picker to load

	// Switch to the server-specific emoji tab
	console.log(`Switching to ${serverName} emoji tab...`)
	const serverEmojiTabSelector: string = `div[aria-label="${serverName}"]`
	await page.waitForSelector(serverEmojiTabSelector, { timeout: 10000 })
	await page.click(serverEmojiTabSelector)
	await delay(2000) // Wait for the server emojis to load

	return `button[aria-label="${env.discordEmojiButtonSelector}"]` // Return the selector to close the picker later
}
