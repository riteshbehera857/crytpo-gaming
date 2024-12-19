import * as jwt from 'jsonwebtoken';

import Container, { Service } from 'typedi';
import getLogger from '../../common/logger';
import {
	AuthSource,
	otpCount,
	developmentOtp,
} from '../../common/config/constants';
import { ApiError, BcryptService } from '../../common/lib';
import config from '../../common/config';
import { AuthDao } from '../daos/auth.dao';
import { ResponseCodes } from '../../common/config/responseCodes';
import { Response } from '../../common/config/response';
import { PlayerLoginDetailsType } from '../../common/types/login';
import { PlayerRegisterDetailsType } from '../../common/types/register';
import {
	loginSchema,
	registerSchema,
} from '../../common/schemas/player.schema';
import { generateResponseCode } from '../../common/lib/generateValidationErrorResponse';
import { SendOtpDetailsType } from '../../common/types/sendOtp';
import otpGenerator from 'otp-generator';
import { PlayerDao } from '../daos/player.dao';
import { VerifyOtpDetailsType } from '../../common/types/verifyOtp';
import { IPlayer } from '../../common/interfaces/player.interface';
import { JwtService } from './jwt.service';
import { CampaignDao } from '../daos/campaign.dao';
import { SystemSettingDao } from '../daos/systemSetting.dao';
import { SmsService } from './sms.service';
import { IMessage } from '../../notifications/interfaces/message';
import { EventTypes, SubTypes } from '../../common/interfaces/event.interface';
import { PublisherService } from '../../notifications/services/publisher.service';
import { DeviceService } from '../../notifications/services/device.service';
import { RedisClientType } from 'redis';
import { redisService } from './redis.service';
import CacheService from '../../notifications/services/cache.service';
import { UserSessionLogDao } from '../daos/userSessionLog.dao';
import { threadId } from 'node:worker_threads';

import FirebaseService from '../../notifications/services/firebase.service';
// import { ITopic } from '../../notifications/interfaces/topic';
import { formatDistance } from 'date-fns';
import { AffiliateDao } from '../../affiliate/daos/affiliate.dao';
import { IAffiliate } from '../../common/interfaces/affiliate.interface';
// Define the AuthService class as a service
@Service()
class AuthService {
	// Initialize a logger for this service
	private logger = getLogger(module);
	private bcryptService: BcryptService;
	private authDao: AuthDao;
	private campaignDao: CampaignDao;
	private playerDao: PlayerDao;
	private jwtService: JwtService;
	private systemSettingDao: SystemSettingDao;
	private smsService: SmsService;
	private redisClient: RedisClientType;
	private publisherService: PublisherService;
	private cacheService: CacheService;
	private userSessionLogDao: UserSessionLogDao;
	private affiliateDao: AffiliateDao;

	// Inject the playerRepository dependency using Dependency Injection (typedi)
	constructor() {
		this.bcryptService = new BcryptService();
		this.authDao = new AuthDao();
		this.playerDao = new PlayerDao();
		this.campaignDao = new CampaignDao();
		this.jwtService = Container.get(JwtService);
		this.smsService = Container.get(SmsService);
		this.systemSettingDao = new SystemSettingDao();
		this.redisClient = redisService.getClient();
		this.publisherService = new PublisherService();
		this.cacheService = Container.get(CacheService);
		this.userSessionLogDao = new UserSessionLogDao();
		this.affiliateDao = new AffiliateDao();
	}

	public async generateHash(password: string): Promise<string> {
		const hashedPass = await this.bcryptService.generateHash(password);

		return hashedPass;
	}

	public async compareHash(
		input: string,
		playerInput: string,
	): Promise<boolean> {
		console.log({ input, playerInput });

		const validInput = await this.bcryptService.compareHash(
			input,
			playerInput,
		);

		return validInput;
	}

	/**
	 * Sends an OTP (One-Time Password) to the player's phone number.
	 * Generates an OTP, hashes it, and stores it in the database along with the player's phone number.
	 * If the player already exists with the provided phone number, updates the OTP.
	 * @param player Details of the player including phone number to send OTP.
	 * @returns A Response indicating the success or failure of OTP sending operation.
	 */
	public async sendOtp(
		player: Record<string, any>,
		campaignId: any,
		trackierToken: string,
		isTrackier: boolean,
	): Promise<Response> {
		try {
			// Check if player exists by phone number
			const playerExistsWithThisPhoneNumber =
				await this.playerDao.getPlayerByPhoneNumber(player.phoneNumber);
			this.logger.debug('Checking complete if campaign exists...');
			console.log({ player });

			// Generate and send OTP
			const otp = await this.handleOtpGeneration(player.phoneNumber);

			// Handle player creation or update
			await this.handlePlayerCreationOrUpdate(
				playerExistsWithThisPhoneNumber,
				player,
				campaignId,
				trackierToken,
				isTrackier,
				otp,
			);

			// Return success response with OTP
			return new Response(
				ResponseCodes.OTP_SENT_SUCCESSFULLY.code,
				ResponseCodes.OTP_SENT_SUCCESSFULLY.message,
			);
		} catch (err) {
			this.logger.error('🔥 error: ' + err?.message);
			throw err;
		}
	}

	/**
	 * Verifies the OTP (One-Time Password) provided by the player.
	 * Compares the provided OTP with the hashed OTP stored in the database.
	 * If the OTP is valid, updates the player's OTP status to validated.
	 * @param data Details including phone number and OTP for OTP verification.
	 * @returns A Response containing the updated player if OTP is successfully verified, or an error response if OTP is invalid.
	 */
	public async verifyOtp(
		data: VerifyOtpDetailsType,
	): Promise<Response<{ token: string }>> {
		try {
			// Retrieve player by phone number
			const player = await this.playerDao.getPlayerByPhoneNumber(
				data.phoneNumber.toString(),
			);
			if (!player) {
				return new Response(
					ResponseCodes.INVALID_PHONE_NUMBER.code,
					ResponseCodes.INVALID_PHONE_NUMBER.message,
				);
			}

			// Validate OTP
			await this.validateOtp(data.otp.toString(), player);

			// Check if session already exists
			const sessionExists = await this.checkSessionExists(
				data.phoneNumber.toString(),
			);
			if (sessionExists) {
				return new Response(
					ResponseCodes.SESSION_ALREADY_EXISTS.code,
					ResponseCodes.SESSION_ALREADY_EXISTS.message,
				);
			}

			// Create session
			await this.createSession(data.phoneNumber.toString(), data.deviceId);

			// Update OTP status and log login events
			await this.updatePlayerOtpAndLogSession(player, data);

			// Generate JWT token
			const token = this.generateJwtToken(player, data);

			// Register device with Google FCM if necessary
			if (data.googleFcmId) {
				await this.registerDeviceWithGoogleFcm(player, data.googleFcmId);
			}

			// Publish login event
			await this.publishLoginEvent(player);

			// Return success response with token
			return new Response<{ token: string }>(
				ResponseCodes.OTP_VERIFIED_SUCCESSFULLY.code,
				ResponseCodes.OTP_VERIFIED_SUCCESSFULLY.message,
				{ token },
			);
		} catch (err) {
			this.logger.error('🔥 error: ' + err?.message);
			throw err;
		}
	}

	/**
	 * Validates the OTP by comparing hashes and checking expiration.
	 */
	private async validateOtp(otp: string, player: IPlayer): Promise<void> {
		const validOtp = await this.compareHash(otp.toString(), player.otp.value);
		if (!validOtp || player.otp.isValidated) {
			throw new Error(ResponseCodes.INVALID_OTP.message);
		}

		const otpCreatedAt = new Date(player.otp.createdAt);
		const expiryTime = new Date(Date.now());
		let timeDistance = formatDistance(otpCreatedAt, expiryTime);
		timeDistance = timeDistance != '' ? timeDistance.split(' ')[0] : '';

		if (parseInt(timeDistance) > 5) {
			throw new Error(ResponseCodes.OTP_HAS_EXPIRED.message);
		}
	}

	/**
	 * Checks if a session already exists for the player.
	 */
	private async checkSessionExists(phoneNumber: string): Promise<boolean> {
		const session = await redisService.getSession(phoneNumber);
		this.logger.silly('Session--', session);
		return !!session;
	}

	/**
	 * Creates a session for the player if none exists.
	 */
	private async createSession(
		phoneNumber: string,
		deviceId: string,
	): Promise<void> {
		const sessionData = {
			deviceId,
			phoneNumber,
		};
		await redisService.createSession(sessionData);
	}

	/**
	 * Updates the player's OTP status to validated and logs session details.
	 */
	private async updatePlayerOtpAndLogSession(
		player: IPlayer,
		data: VerifyOtpDetailsType,
	): Promise<void> {
		const validatedPlayerOtp: IPlayer['otp'] = {
			value: player.otp.value,
			createdAt: player.otp.createdAt,
			validatedAt: Date.now() as unknown as Date,
			isValidated: true,
		};

		await this.playerDao.findPlayerByPhoneNumberAndUpdateOtp(
			data.phoneNumber.toString(),
			validatedPlayerOtp,
		);

		const previousSessions =
			await this.userSessionLogDao.findUserSessionLogsWhereLogoutIsNull(
				player.phoneNumber,
			);
		this.logger.info(
			`Found user's session logs: ${JSON.stringify(previousSessions)}`,
		);
		if (previousSessions.length) {
			await this.userSessionLogDao.updateUserSessionLogsLogoutTime(
				player.phoneNumber,
			);
		}

		await this.userSessionLogDao.createUserSessionLogLoginTime(
			player.phoneNumber,
		);
	}

	/**
	 * Generates a JWT token for the player.
	 */
	private generateJwtToken(
		player: IPlayer,
		data: VerifyOtpDetailsType,
	): string {
		return this.jwtService.generateToken({
			playerId: player._id as unknown as string,
			phoneNumber: parseInt(player.phoneNumber),
			deviceId: data.deviceId,
		});
	}

	/**
	 * Registers the player's device with Google FCM.
	 */
	private async registerDeviceWithGoogleFcm(
		player: IPlayer,
		googleFcmId: string,
	): Promise<void> {
		const deviceService = Container.get(DeviceService);
		await deviceService.registerDevice({
			userId: player._id.toString(),
			id: player._id.toString(),
			name: player?.name,
			token: googleFcmId,
		});
	}

	/**
	 * Publishes a login event after successful OTP verification.
	 */
	private async publishLoginEvent(player: IPlayer): Promise<void> {
		const loginEvent: IMessage = {
			type: EventTypes.LOGIN,
			subType: SubTypes.LOGIN,
			ts: Date.now(),
			userId: player._id as unknown as string,
			payload: {
				playerId: player._id,
				date: new Date(),
			},
		};
		await this.publisherService.publishMessage(loginEvent, 'notification');
	}

	/**
	 * Generates OTP and handles SMS sending.
	 */
	private async handleOtpGeneration(phoneNumber: string): Promise<string> {
		// Generate OTP and hash it
		const otp = (await this.generateOtp(phoneNumber)) as unknown as string;
		this.logger.silly('Getting system settings...');
		const systemSetting = await this.systemSettingDao.getSystemSetting();
		this.logger.silly('Successfully fetched system settings...');

		// Send OTP via SMS gateway
		if (systemSetting.useSMSGateway) {
			const smsResponse = await this.smsService.sendSms(phoneNumber, otp);
			if (!smsResponse.data.includes('msg-id')) {
				this.logger.error(
					`Error sending sms: ${JSON.stringify(smsResponse.data)}`,
				);
				throw new Error(ResponseCodes.OTP_SENDING_FAILED.message);
			} else {
				this.logger.info(
					`Sms gateway response: ${JSON.stringify(smsResponse.data)}`,
				);
			}
		}

		return otp;
	}

	/**
	 * Handles player creation or updating existing player with OTP.
	 */
	private async handlePlayerCreationOrUpdate(
		playerExists: any,
		player: Record<string, any>,
		campaignId: any,
		trackierToken: string,
		isTrackier: boolean,
		otp: string,
	): Promise<void> {
		const hashedOtp = await this.generateHash(otp?.toString());
		const playerOtp: IPlayer['otp'] = {
			value: hashedOtp,
			createdAt: Date.now() as unknown as Date,
			isValidated: false,
		};

		if (!playerExists) {
			const campaignData = await this.handleCampaignData(
				campaignId,
				isTrackier,
			);

			const newPlayer =
				await this.playerDao.createPlayerWithPhoneNumberAndOtp(
					player.phoneNumber,
					playerOtp,
					campaignData,
				);
			const registerEvent = this.buildRegisterEvent(
				newPlayer._id as unknown as string,
				player,
				trackierToken,
			);

			await this.publisherService.publishMessage(
				registerEvent,
				'notification',
			);
		} else {
			this.logger.debug('Updating player OTP...');
			await this.playerDao.findPlayerByPhoneNumberAndUpdateOtp(
				player.phoneNumber,
				playerOtp,
			);
			this.logger.debug('Updated player OTP...');
		}
	}

	/**
	 * Fetches campaign data based on internal affiliate or Trackier.
	 */
	private async handleCampaignData(
		campaignId: any,
		isTrackier: boolean,
	): Promise<any> {
		let campaignData = null;

		const { internalAffiliate, trackierAffiliate } =
			await this.fetchInternalAndTrackierAffiliateDetails();
		this.logger.silly(
			'Internal affiliate: ' + JSON.stringify(internalAffiliate),
		);
		this.logger.silly(
			'Trackier affiliate: ' + JSON.stringify(trackierAffiliate),
		);

		if (campaignId && !isTrackier) {
			campaignData = await this.campaignDao.getCampaignById(campaignId);
		}

		if (
			isTrackier &&
			trackierAffiliate &&
			Object.keys(trackierAffiliate).length > 0
		) {
			campaignData = { affiliateId: trackierAffiliate._id };
		}

		if (
			!campaignId &&
			!isTrackier &&
			internalAffiliate &&
			Object.keys(internalAffiliate).length > 0
		) {
			campaignData = { affiliateId: internalAffiliate._id };
		}

		return campaignData;
	}

	/**
	 * Builds register event for new player registration.
	 */
	private buildRegisterEvent(
		playerId: string,
		player: Record<string, any>,
		trackierToken: string,
	): IMessage {
		return {
			type: EventTypes.AUTHENTICATION,
			subType: SubTypes.REGISTER,
			ts: Date.now(),
			userId: playerId,
			payload: {
				playerId: playerId,
				date: new Date(),
				...(player.bonusCode ? { code: player.bonusCode } : {}),
				trackierToken: trackierToken || null,
				promocode: trackierToken
					? null
					: config.trackierConfig.trackier_promocode,
			},
		};
	}

	public async fetchInternalAndTrackierAffiliateDetails(): Promise<{
		internalAffiliate: IAffiliate;
		trackierAffiliate: IAffiliate;
	}> {
		try {
			const affiliates =
				await this.affiliateDao.fetchInternalAndTrackierAffiliateDetails();

			const internalAffiliate = affiliates.find(
				(affiliate) => affiliate.name == 'Internal',
			);
			const trackierAffiliate = affiliates.find(
				(affiliate) => affiliate.name == 'Trackier',
			);

			return {
				internalAffiliate: internalAffiliate,
				trackierAffiliate: trackierAffiliate,
			};
		} catch (error) {
			throw error;
		}
	}

	public async tokenValidation(token: any): Promise<any> {
		if (!token) {
			return new Response(
				ResponseCodes.USER_NOT_FOUND.code,
				ResponseCodes.USER_NOT_FOUND.message,
			);
		}

		const payload = this.jwtService.verifyToken(token);

		return payload;
	}

	public async validateSession(player: IPlayer): Promise<Response> {
		try {
			if (!player.phoneNumber) {
				this.logger.debug(
					`Phone number is not available for session validation: -`,
				);
				return new Response(
					ResponseCodes.PHONE_NUMBER_IS_REQUIRED.code,
					ResponseCodes.PHONE_NUMBER_IS_REQUIRED.message,
				);
			}

			const usersPreviousSessionFromSessionLog =
				await this.userSessionLogDao.findUserSessionLogsWhereLogoutIsNull(
					player.phoneNumber,
				);
			this.logger.silly(
				`Found user's previous session logs: ${JSON.stringify(usersPreviousSessionFromSessionLog)}`,
			);

			if (usersPreviousSessionFromSessionLog.length) {
				this.logger.silly(`Updating user's session logs: -`);
				const _ =
					await this.userSessionLogDao.updateUserSessionLogsLogoutTime(
						player.phoneNumber,
					);
				this.logger.silly(`Updated user's session logs: -`);
			}
			const _ = await this.userSessionLogDao.createUserSessionLogLoginTime(
				player.phoneNumber,
			);

			return new Response(
				ResponseCodes.SESSION_VALIDATED_SUCCESSFULLY.code,
				ResponseCodes.SESSION_VALIDATED_SUCCESSFULLY.message,
			);
		} catch (error) {
			this.logger.error('🔥 error: ' + error?.message);
			throw error;
		}
	}

	public async appExited(phoneNumber: string): Promise<Response> {
		try {
			if (!phoneNumber) {
				this.logger.debug(
					'Phone number not available for removing session: -',
				);
				return new Response(
					ResponseCodes.PHONE_NUMBER_IS_REQUIRED.code,
					ResponseCodes.PHONE_NUMBER_IS_REQUIRED.message,
				);
			}

			const player =
				await this.playerDao.getPlayerByPhoneNumber(phoneNumber);

			if (!player) {
				return new Response(
					ResponseCodes.PLAYER_NOT_FOUND.code,
					ResponseCodes.PLAYER_NOT_FOUND.message,
				);
			}

			this.logger.silly(`Updating user's session logs: -`);
			const _ =
				await this.userSessionLogDao.updateUserSessionLogsLogoutTime(
					phoneNumber,
				);
			this.logger.silly(`Updated user's session logs: -`);

			return new Response(
				ResponseCodes.SESSION_UPDATED_SUCCESSFULLY.code,
				ResponseCodes.SESSION_UPDATED_SUCCESSFULLY.message,
			);
		} catch (error) {
			this.logger.error('🔥 error: ' + JSON.stringify(error));
			throw error;
		}
	}

	public async terminateSession(data: Record<string, any>): Promise<Response> {
		try {
			const player = await this.playerDao.getPlayerByPhoneNumber(
				data.phoneNumber,
			);

			if (!player) {
				return new Response(
					ResponseCodes.PLAYER_NOT_FOUND.code,
					ResponseCodes.PLAYER_NOT_FOUND.message,
				);
			}

			const session = await redisService.getSession(
				data.phoneNumber.toString(),
			);

			console.log('Session to be deleted--', session);

			if (!session) {
				return new Response(
					ResponseCodes.SESSION_NOT_FOUND.code,
					ResponseCodes.SESSION_NOT_FOUND.message,
				);
			}

			const deletedSession = await redisService.deleteSession(
				data.phoneNumber.toString(),
			);

			if (data?.phoneNumber) {
				const _ =
					await this.userSessionLogDao.updateUserSessionLogsLogoutTime(
						data.phoneNumber,
					);
			}

			console.log('Deleted Session--', deletedSession);

			return new Response(
				ResponseCodes.PREV_SESSION_TERMINATED.code,
				ResponseCodes.PREV_SESSION_TERMINATED.message,
			);
		} catch (error) {
			this.logger.error('🔥 error: ' + JSON.stringify(error));
			throw error;
		}
	}

	// Private method to generate a JWT token
	private generateToken(data: any) {
		this.logger.silly(`Sign JWT for userId: ${data.playerId}`);
		return jwt.sign(data, config.jwtSecret, {
			algorithm: 'HS256',
			expiresIn: config.jwtExpiresIn,
		});
	}

	private async generateOtp(mobile?: string | number): Promise<number> {
		const setting = await this.systemSettingDao.getSystemSetting();
		if (!setting.useSMSGateway && config.isDev) {
			const otp = parseInt(developmentOtp);
			console.log(
				otp,
				'----------------------------------------------------------------',
			);
			return otp;
		} else {
			const otp = parseInt(
				otpGenerator.generate(otpCount, {
					digits: true,
					upperCaseAlphabets: false,
					specialChars: false,
					lowerCaseAlphabets: false,
				}),
			);
			console.log(
				otp,
				'-----++++-----------------------------------------------------------',
			);
			return otp;
		}
	}
}

export { AuthService };
