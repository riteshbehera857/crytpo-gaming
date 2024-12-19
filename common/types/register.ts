import { IPlayer } from '../interfaces/player.interface';

type PlayerRegisterDetailsType = Pick<
	IPlayer,
	'email' | 'password' | 'name' | 'source' | 'role' | 'phoneNumber'
>;

export { PlayerRegisterDetailsType };
