import jwt, { JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import { Service } from 'typedi';
import { Logger } from 'winston';
import getLogger from '../../common/logger';
import config from '../../common/config';
import { Response } from '../../common/config/response';
import { ResponseCodes } from '../../common/config/responseCodes';

@Service()
class JwtService {
	logger: Logger;

	constructor() {
		this.logger = getLogger(module);
	}

	public generateToken(data: {
		playerId: string;
		email?: string;
		phoneNumber?: number;
		deviceId?: string;
	}): string {
		this.logger.silly(`Sign JWT for userId: ${data.playerId}`);
		return jwt.sign(data, config.jwtSecret, {
			algorithm: 'HS256',
			expiresIn: config.jwtExpiresIn,
		});
	}

	public decodeToken(token: string): {
		playerId: string;
		email?: string;
		phoneNumber?: number;
	} {
		const decodedValue = jwt.verify(token, config.jwtSecret) as {
			playerId: string;
			email?: string;
			phoneNumber?: number;
		};

		return decodedValue;
	}

	public verifyToken(token: any): any {
		try {
			const decodedValue = jwt.verify(token, config.jwtSecret) as JwtPayload;

			console.log('decodedValue', decodedValue);

			if (!decodedValue) {
				return new Response(
					ResponseCodes.USER_NOT_FOUND.code,
					ResponseCodes.USER_NOT_FOUND.message,
				);
			}
			return { playerId: decodedValue?.playerId };
		} catch (err) {
			return new Response(
				ResponseCodes.INVALID_TOKEN.code,
				ResponseCodes.INVALID_TOKEN.message,
			);
		}
	}
}

export { JwtService };
