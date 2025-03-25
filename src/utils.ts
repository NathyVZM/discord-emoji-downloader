/**
 * Delays the execution for a specified number of milliseconds.
 *
 * @param {number} ms - The number of milliseconds to delay.
 * @returns {Promise<void>} A promise that resolves after the specified delay.
 */
export const delay = (ms: number): Promise<void> => {
	const { promise, resolve } = Promise.withResolvers<void>()
	setTimeout(resolve, ms)
	return promise
}

/**
 * Prompts the user to enter their 2FA (Two-Factor Authentication) code.
 *
 * @returns {Promise<string>} A promise that resolves to the entered 2FA code as a trimmed string.
 * @throws {Error} If no 2FA code is provided by the user.
 */
export const promptFor2FACode = async (): Promise<string> => {
	const code: string | null | undefined = prompt('Please enter your 2FA code: ')?.trim()
	if (!code) {
		throw new Error('No 2FA code provided')
	}
	return code
}
