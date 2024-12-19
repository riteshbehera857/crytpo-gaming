import { Model, Schema } from 'mongoose';
import { TransactionEnum } from '../types/transaction';
import { CurrencyEnum } from '../types/currency';
import { BankDetail } from './player.interface';

interface IBonusTransactionDetailsForBonus {
	campaignId: Schema.Types.ObjectId;
	releaseType: 'locked' | 'unlocked';
}

interface IBonusTransactionDetailsForGames {
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

interface IBonusTransaction<T = unknown> {
	_id?: Schema.Types.ObjectId;
	player: Schema.Types.ObjectId;
	amount: number;
	currency: CurrencyEnum;
	transactionType: TransactionEnum;
	moneyType?: string;
	skinId?: string;
	openingBalance: number;
	closingBalance: number;
	details?: T extends IBonusTransactionDetailsForBonus
		? IBonusTransactionDetailsForBonus
		: T extends IBonusTransactionDetailsForGames
			? IBonusTransactionDetailsForGames
			: IBonusTransactionDetailsForBonus | IBonusTransactionDetailsForGames;
	isTransactionSuccess: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

interface BonusTransactionQueryHelpers {}

interface IBonusTransactionModel
	extends Model<IBonusTransaction, BonusTransactionQueryHelpers> {}

export {
	IBonusTransaction,
	BonusTransactionQueryHelpers,
	IBonusTransactionModel,
	IBonusTransactionDetailsForGames,
	IBonusTransactionDetailsForBonus,
};
