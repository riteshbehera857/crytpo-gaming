import { Model, Schema } from 'mongoose';
import { TransactionEnum } from '../types/transaction';
import { CurrencyEnum } from '../types/currency';
import { BankDetail } from './player.interface';

interface ITransactionDetailsForPayments {
	paymentGateway?: string;
	amountWithCommission?: number;
	orderId?: string;
	paymentTransactionId?: string;
	paymentMethod?: string;
	bankDetails?: BankDetail;
}

interface ITransactionDetailsForBonus {
	campaignId: Schema.Types.ObjectId;
	releaseType: 'locked' | 'unlocked';
}

interface ITransactionDetailsForGames {
	transactionUuid: string;
	supplierUser?: string;
	roundClosed?: boolean;
	round?: string;
	rewardId?: string;
	requestUuid: string;
	isFree?: false;
	gameId?: number;
	gameCode?: string;
	bet?: string;
	betId?: string;
	isAggregated?: boolean;
}

interface ITransaction<T = unknown> {
	_id?: Schema.Types.ObjectId;
	player: Schema.Types.ObjectId;
	amount: number;
	currency: CurrencyEnum;
	transactionType: TransactionEnum;
	moneyType?: string;
	note?: string;
	createdBy?: Schema.Types.ObjectId;
	skinId?: string;
	openingBalance: number;
	closingBalance: number;
	details?: T extends ITransactionDetailsForPayments
		? ITransactionDetailsForPayments
		: T extends ITransactionDetailsForGames
			? ITransactionDetailsForGames
			: T extends ITransactionDetailsForBonus
				? ITransactionDetailsForBonus
				:
						| ITransactionDetailsForPayments
						| ITransactionDetailsForGames
						| ITransactionDetailsForBonus;
	isTransactionSuccess: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

interface TransactionQueryHelpers {}

interface ITransactionModel
	extends Model<ITransaction, TransactionQueryHelpers> {}

export {
	ITransaction,
	TransactionQueryHelpers,
	ITransactionModel,
	ITransactionDetailsForGames,
	ITransactionDetailsForPayments,
	ITransactionDetailsForBonus,
};
