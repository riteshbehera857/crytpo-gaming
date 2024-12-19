import { IPlayer } from '../interfaces/player.interface';

type SendOtpDetailsType = Pick<IPlayer, 'phoneNumber' | 'campaignId'> & {
	bonusCode: string;
};

export { SendOtpDetailsType };
