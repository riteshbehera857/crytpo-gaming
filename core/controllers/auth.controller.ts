import { NextFunction, Request, Response } from 'express';
import getLogger from '../../common/logger/index';
import { Container } from 'typedi';
import { AuthService } from './../services/auth.service';
import { PlayerRegisterDetailsType } from '../../common/types/register';
import { PlayerLoginDetailsType } from '../../common/types/login';
import { Player } from '../../common/classes/player.class';
import { SendOtpDetailsType } from '../../common/types/sendOtp';
import { VerifyOtpDetailsType } from '../../common/types/verifyOtp';
import { ObjectId } from 'mongoose';

export default class AuthController {
	private static log = getLogger(module);

	public static async tokenValidation(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		this.log.debug(
			'Calling api /auth/validateToken with body: ' +
				JSON.stringify({ ...req.body }),
		);

		try {
			const token = req?.body?.token;
			const authService = Container.get(AuthService);

			const resp = await authService.tokenValidation(token);

			return resp;
		} catch (error: any) {
			// Log and pass the error to the next middleware
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}

	public static async validateSession(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		this.log.debug('Calling api /auth/validate-session with body: ');

		try {
			const user = req.currentUser;

			const authService = Container.get(AuthService);

			const response = await authService.validateSession(user);

			return response;
		} catch (error) {
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}

	public static async appExited(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		this.log.debug(
			`Calling api /auth/update-session with body: ${JSON.stringify(req.body)}`,
		);

		try {
			const phoneNumber = req.body.phoneNumber;

			const authService = Container.get(AuthService);

			const response = await authService.appExited(phoneNumber);

			return response;
		} catch (error) {
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}

	public static async sendOtp(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		// Log the API call details (excluding the password for security)
		this.log.debug(
			'Calling api /auth/otp/send-otp with body: ' +
				JSON.stringify({ ...req.body }),
		);

		const { campaignId, isTrackier, trackierToken } = req.query;

		try {
			const data = {
				phoneNumber: req.body?.phoneNumber as unknown as string,
				...(req.body?.bonusCode
					? { bonusCode: req.body?.bonusCode as unknown as string }
					: {}),
			};

			const authService = Container.get(AuthService);

			const resp = await authService.sendOtp(
				data,
				campaignId as any,
				trackierToken as unknown as string,
				isTrackier as unknown as boolean,
			);

			return resp;
		} catch (error) {
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}

	public static async verifyOtp(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		// Log the API call details (excluding the password for security)
		this.log.debug(
			'Calling api /auth/otp/verify-otp with body: ' +
				JSON.stringify({ ...req.body, otp: '(removed)' }),
		);

		try {
			const data: VerifyOtpDetailsType = {
				phoneNumber: req.body.phoneNumber,
				otp: req.body.otp,
				deviceId: req.body.deviceId,
				googleFcmId: req.body.googleFcmId,
			};

			const authService = Container.get(AuthService);

			const resp = authService.verifyOtp(data);

			return resp;
		} catch (error) {
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}

	public static async terminateSession(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		// Log the API call details (excluding the password for security)
		this.log.debug(
			'Calling api /terminate-session with body: ' +
				JSON.stringify({ ...req.body, otp: '(removed)' }),
		);

		try {
			const data: Record<string, any> = {
				phoneNumber: req.body.phoneNumber,
				otp: req.body.otp,
				deviceId: req.body.deviceId,
			};

			const authService = Container.get(AuthService);

			const resp = authService.terminateSession(data);

			return resp;
		} catch (error) {
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}

	// public static async metamaskLogin(
	// 	req: Request,
	// 	res: Response,
	// 	next: NextFunction,
	// ) {
	// 	// Log the API call details
	// 	this.log.debug(
	// 		'Calling api /auth/metamask with body: ' + JSON.stringify(req.body),
	// 	);

	// 	try {
	// 		// Destructure address from the request body
	// 		const { address } = req.body;

	// 		// Create an instance of the AuthService from the dependency injection container
	// 		const authService = Container.get(AuthService);

	// 		// Call the metamaskLogin method of AuthService with the provided address
	// 		const resp = await authService.metamaskLogin(address);

	// 		// Send the JSON response with a 200 status code
	// 		return res.json(resp).status(200);
	// 	} catch (error) {
	// 		// Log and pass the error to the next middleware
	// 		this.log.error('🔥 error: ' + error?.message);
	// 		return next(error);
	// 	}
	// }
}
