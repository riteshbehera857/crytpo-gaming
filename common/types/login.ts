import { IPlayer } from '../interfaces/player.interface';

type PlayerLoginDetailsType = Pick<IPlayer, 'email' | 'password'>;

export { PlayerLoginDetailsType };
