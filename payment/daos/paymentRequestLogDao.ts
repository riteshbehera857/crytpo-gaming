import { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
// import Player, { PlayerType } from '../models/player.model';
import PaymentRequestLog from '../models/paymentRequestLog.model';
import { IPaymentRequestLog } from '../../common/interfaces/paymentRequestLog.interface';
import { IPlayer } from '../../common/interfaces/player.interface';

class PaymentRequestDao {
	private paymentRequestLogModel: Model<IPaymentRequestLog>;

	constructor() {
		this.paymentRequestLogModel = PaymentRequestLog;
	}

	public async create(
		paymentRequest: Partial<IPaymentRequestLog>,
	): Promise<IPaymentRequestLog> {
		const newPaymentRequest = await this.paymentRequestLogModel.create({
			user: paymentRequest.user,
			requestType: paymentRequest.requestType,
			requestData: paymentRequest.requestData,
			referenceId: paymentRequest.referenceId,
		});

		return newPaymentRequest;
	}

	public async getRequestByReferenceId({
		referenceId,
	}: {
		referenceId: string;
	}): Promise<IPaymentRequestLog | null> {
		const paymentRequestLog = await this.paymentRequestLogModel.findOne({
			referenceId,
		});
		return paymentRequestLog;
	}

	public async getPaymentRequestsByPlayerId(
		playerId: IPlayer['_id'],
	): Promise<IPaymentRequestLog[]> {
		const paymentRequestLog = await this.paymentRequestLogModel
			.find({
				user: playerId,
			})
			.sort({
				transactionCompletedAt: -1,
			});

		return paymentRequestLog;
	}

	public async findOneAndUpdate(
		query: FilterQuery<IPaymentRequestLog>,
		update: UpdateQuery<IPaymentRequestLog>,
		options?: QueryOptions<IPaymentRequestLog>,
	): Promise<IPaymentRequestLog> {
		const paymentRequestLog =
			await this.paymentRequestLogModel.findOneAndUpdate(
				query,
				update,
				options,
			);

		return paymentRequestLog;
	}

	public async updatePaymentRequestLogByReferenceId(
		referenceId: IPaymentRequestLog['referenceId'],
		update: Partial<IPaymentRequestLog>,
	): Promise<IPaymentRequestLog> {
		const paymentRequestLog = await this.findOneAndUpdate(
			{ referenceId },
			{ ...update },
		);

		return paymentRequestLog;
	}

	// public async ifPlayerExistsOrNot(
	// 	player: Partial<PlayerType>,
	// ): Promise<boolean> {
	// 	const playerExists = await this.paymentRequestLogModel.findOne({
	// 		email: player.email,
	// 	});

	// 	if (playerExists) return true;
	// 	return false;
	// }
	// public async login(player: Partial<PlayerType>): PlayerType {}
}

export { PaymentRequestDao };
