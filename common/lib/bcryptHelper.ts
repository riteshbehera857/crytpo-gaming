import bcrypt from 'bcryptjs';
import { IBcrypt } from './../types/bcrypt';

class BcryptService implements IBcrypt {
	public async generateHash(input: string): Promise<string> {
		const salt = await bcrypt.genSalt(12);
		return await bcrypt.hash(input, salt);
	}
	public async compareHash(
		input: string,
		userInput: string,
	): Promise<boolean> {
		return await bcrypt.compare(input, userInput);
	}
}

export { BcryptService };
