import { Response } from '../config/response';
import { VerifyOtpDetailsType } from '../types/verifyOtp';

export interface IAuthService {
	sendOtp(
		player: Record<string, any>,
		campaignId: string,
		trackierToken: string,
		isTrackier: boolean,
	): Promise<Response>;

	verifyOtp(data: VerifyOtpDetailsType): Promise<Response<{ token: string }>>;
}
