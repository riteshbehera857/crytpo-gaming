export interface IBcrypt {
	generateHash: (password: string) => Promise<string>;
	compareHash: (password: string, userPassword: string) => Promise<boolean>;
}
