import { IKyc } from '../../common/interfaces/kyc.interface';
import getLogger from '../../common/logger';
import { Response } from '../../common/config/response';
import { ResponseCodes } from '../../common/config/responseCodes';
import { kycSchema, updateKycSchema } from '../../common/schemas/kyc.schema';
import { generateResponseCode } from '../../common/lib/generateValidationErrorResponse';
import { CommonPlayerDao } from '../../common/daos/commonPlayer.dao';
import { KycDao } from '../dao/kyc.dao';
import { Kyc } from '../../common/classes/kyc.class';
import { Schema } from 'mongoose';
import fs from 'fs';

export default class KycService {
	private logger = getLogger(module);
	private commonPlayerDao: CommonPlayerDao;
	private kycDao: KycDao;

	constructor() {
		this.commonPlayerDao = new CommonPlayerDao();
		this.kycDao = new KycDao();
	}

	public async createPlayerKyc(kyc: IKyc, player: any): Promise<Response> {
		try {
			const { error, value } = kycSchema.validate(kyc);
			if (error) {
				const responseCode = generateResponseCode(error);
				// console.log({ responseCode: responseCode });
				if (responseCode) {
					if ('message' in responseCode && 'code' in responseCode) {
						// Return a response with the generated response code
						return new Response(responseCode.code, responseCode.message);
					}
				}
			}

			const playerData = await this.commonPlayerDao.getPlayerById(player);

			if (!playerData) {
				return new Response(
					ResponseCodes.PLAYER_NOT_FOUND.code,
					ResponseCodes.PLAYER_NOT_FOUND.message,
				);
			}

			const playerKycExists = await this.kycDao.getKycByPlayer(player._id);

			if (playerKycExists) {
				const deletedKyc =
					await this.kycDao.deletePlayerKyc(playerKycExists);
			}

			const kycData = {
				player: playerData._id,
				docType: value.docType,
				addressProof:
					value?.docProofType === 'ADDRESSPROOF'
						? fs.readFileSync(value.path)
						: null,
				ageProof:
					value?.docProofType === 'AGEPROOF'
						? fs.readFileSync(value.path)
						: null,
				mimeType: value.mimetype,
			};

			// const existKyc = await this.kycDao.getKycByPlayer(player._id);

			// if (existKyc) {
			// 	const updateKyc = this.kycDao.updateAgeProof(existKyc._id, kycData);
			// 	return new Response(
			// 		ResponseCodes.PLAYER_KYC_UPDATED_SUCCESSFULLY.code,
			// 		ResponseCodes.PLAYER_KYC_UPDATED_SUCCESSFULLY.message,
			// 		updateKyc,
			// 	);
			// }
			// console.log(
			// 	'---------------=====================================================',
			// 	player,
			// );

			const newKyc = await this.kycDao.createKyc(kycData);

			// console.log({ newKyc });

			return new Response(
				ResponseCodes.PLAYER_KYC_CREATED_SUCCESSFULLY.code,
				ResponseCodes.PLAYER_KYC_CREATED_SUCCESSFULLY.message,
				newKyc,
			);
		} catch (error) {
			throw error;
		}
	}

	public async updatePlayerKyc(
		kycData: IKyc,
		id: Schema.Types.ObjectId,
	): Promise<Response> {
		const { error, value } = updateKycSchema.validate(kycData);
		if (error) {
			const responseCode = generateResponseCode(error);
			// console.log({ responseCode: responseCode });
			if (responseCode) {
				if ('message' in responseCode && 'code' in responseCode) {
					// Return a response with the generated response code
					return new Response(responseCode.code, responseCode.message);
				}
			}
		}
		const existKyc = await this.kycDao.getKycById(id);

		if (!existKyc) {
			return new Response(
				ResponseCodes.PLAYER_KYC_NOT_FOUND.code,
				ResponseCodes.PLAYER_KYC_NOT_FOUND.message,
			);
		}

		const kyc: IKyc = new Kyc(value);

		await this.kycDao.updateKyc(kyc, id);

		const updatedKyc = await this.kycDao.getKycById(id);

		return new Response(
			ResponseCodes.PLAYER_KYC_UPDATED_SUCCESSFULLY.code,
			ResponseCodes.PLAYER_KYC_UPDATED_SUCCESSFULLY.message,
			updatedKyc,
		);
	}
}
