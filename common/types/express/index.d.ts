// import { Repository } from 'typeorm';
// import { Player } from '../../orm/entities/Player';
import { TokenPayload } from 'google-auth-library';
import { IPlayer } from '../../interfaces/player.interface';
// import { Deposit } from '../../orm/entities/Deposit';
// import { Withdraw } from '../../orm/entities/Withdraw';
// import { Wallet } from '../../orm/entities/Wallet';

declare global {
	namespace Express {
		export interface Request {
			currentUser: IPlayer;
			googleUserObj: TokenPayload;
			skillzUser: SkillzUser;
		}
	}

	// namespace Models {
	//   export type PlayerRepository = Repository<Player>;

	//   export type DepositRepository = Repository<Deposit>;
	//   export type WithdrawRepository = Repository<Withdraw>;
	//   export type WalletRepository = Repository<Wallet>;
	// }
}

interface SkillzUser {
	city: string;
	country: string;
	customerName: string;
	email: string;
	mobileNumber: string;
	state: string;
	userId: string;
	zipCode: string;
}
