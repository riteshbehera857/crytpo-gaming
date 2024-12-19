import { Model, Schema, UpdateWriteOpResult } from 'mongoose';

import { CommonPlayerDao } from '../../common/daos/commonPlayer.dao';
import { IKyc } from '../../common/interfaces/kyc.interface';
import { Kyc } from '../models/kyc.model';
import { KycStatus } from '../../common/types/kyc';
import { KycLogDao } from './kycLog.dao';

class KycDao {
	private kycModel: Model<IKyc>;
	private commonPlayerDao: CommonPlayerDao;
	private kycLogDao: KycLogDao;

	constructor() {
		this.kycModel = Kyc;
		this.commonPlayerDao = new CommonPlayerDao();
		this.kycLogDao = new KycLogDao();
	}

	// public async getTransaction(transactionData: any): Promise<ITransaction> {
	// 	const transaction = await this.transactionModel.aggregate([
	// 		{
	// 			$match: {
	// 				'details.transactionUuid':
	// 					transactionData.details.transactionUuid,
	// 				transactionType: transactionData.transactionType,
	// 			},
	// 		},
	// 		{
	// 			$set: {
	// 				createdAt: {
	// 					$dateToString: {
	// 						format: '%Y-%m-%d %H:%M:%S',
	// 						date: '$createdAt',
	// 					},
	// 				},
	// 				updatedAt: {
	// 					$dateToString: {
	// 						format: '%Y-%m-%d %H:%M:%S',
	// 						date: '$updatedAt',
	// 					},
	// 				},
	// 			},
	// 		},
	// 	]);
	// 	console.log(transaction);

	// 	return transaction[0];
	// }

	public async createKyc(kyc: any): Promise<IKyc> {
		try {
			const query = {
				player: kyc.player,
			};
			const update = {
				$set: {
					...(kyc.addressProof
						? {
								addressProof: {
									docType: kyc.docType,
									document: {
										data: kyc.addressProof,
										contentType: kyc.mimeType,
									},
								},
							}
						: {}),
					...(kyc.ageProof
						? {
								ageProof: {
									docType: kyc.docType,
									document: {
										data: kyc.ageProof,
										contentType: kyc.mimeType,
									},
								},
							}
						: {}),
				},
			};

			const options = { upsert: true, new: true };

			let newKyc: UpdateWriteOpResult | IKyc = await this.kycModel.updateOne(
				query,
				update,
				options,
			);

			if (newKyc.upsertedId) {
				newKyc = await this.kycModel.findOne({ _id: newKyc.upsertedId });
			} else {
				newKyc = await this.kycModel.findOne(query);
			}

			if (newKyc) {
				const createdKyc = await this.getKycById((newKyc as IKyc)._id);

				const updateKyc = await this.kycModel.updateOne(
					{ _id: createdKyc._id },
					{
						status:
							typeof createdKyc.ageProof.docType !== 'undefined' &&
							typeof createdKyc.addressProof.docType !== 'undefined'
								? KycStatus.PROCESSING
								: KycStatus.INCOMPLETE,
					},
				);

				const updateKycDataInPlayer = {
					isVerified: false,
					kycStatus:
						typeof createdKyc.ageProof.docType !== 'undefined' &&
						typeof createdKyc.addressProof.docType !== 'undefined'
							? KycStatus.PROCESSING
							: KycStatus.INCOMPLETE,
				};

				// console.log({ updateKycDataInPlayer });

				const updatedPlayer = await this.commonPlayerDao.findOneAndUpdate(
					{ _id: createdKyc.player },
					{
						kyc: updateKycDataInPlayer,
					},
					{},
				);
			}

			return newKyc as IKyc;
		} catch (error) {
			throw error;
		}
	}

	public async deletePlayerKyc(kyc: IKyc): Promise<any> {
		const createKycLog = await this.kycLogDao.createKycLog({
			addressProof: kyc.addressProof,
			ageProof: kyc.ageProof,
			isApproved: kyc.isApproved,
			player: kyc.player,
			status: kyc.status,
		});

		const deletedKyc = await this.kycModel.findByIdAndDelete(kyc._id);

		return deletedKyc;
	}

	public async getKycById(id: any): Promise<IKyc> {
		const user = await this.kycModel.findById(id);

		return user;
	}

	public async getKycByPlayer(id: any): Promise<IKyc> {
		const kyc = await this.kycModel
			.findOne({ player: id })
			.where('status')
			.in(['APPROVED', 'REJECTED']);

		return kyc;
	}

	public async updateKyc(
		kyc: IKyc,
		_id: Schema.Types.ObjectId,
	): Promise<IKyc> {
		const updateKyc = await this.kycModel.findByIdAndUpdate(_id, {
			status:
				kyc.status === KycStatus.APPROVED
					? KycStatus.APPROVED
					: KycStatus.REJECTED,
			isApproved: kyc.status === KycStatus.APPROVED ? true : false,
		});

		return updateKyc;
	}
}

export { KycDao };
