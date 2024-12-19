import getLogger from '../../common/logger';
import fs from 'fs';
import crypto from 'node:crypto';
import { Service } from 'typedi';
import { Logger } from 'winston';

@Service()
class CasinoService {
	private logger: Logger;
	private privateKey: Buffer;

	constructor() {
		this.logger = getLogger(module);
		this.privateKey = fs.readFileSync('.keys/private.key');
	}

	/**
	 * Generates a signature for the provided data using RSA-SHA256 algorithm.
	 * @param data The data to be signed.
	 * @returns The signature string generated for the provided data.
	 */
	public generateSignature(data): string {
		// Convert the data to a buffer
		const bufferData = Buffer.from(JSON.stringify(data));
		// Sign the buffer data using RSA-SHA256 algorithm and the private key
		const signature = crypto
			.sign('RSA-SHA256', bufferData, this.privateKey)
			.toString('base64');

		console.log({ signature });

		// Log a message indicating that signing is done
		this.logger.info(`Signing done`);

		// Return the generated signature
		return signature;
	}
}

export { CasinoService };
