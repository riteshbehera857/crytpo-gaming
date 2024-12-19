import {
	ITransaction,
	ITransactionDetailsForGames,
	ITransactionDetailsForPayments,
} from '../interfaces/transaction.interface';
import { CurrencyEnum } from '../types/currency';
import { TransactionEnum } from '../types/transaction';
import { Schema } from 'mongoose';

class Transaction
	implements
		ITransaction<
			ITransactionDetailsForPayments | ITransactionDetailsForGames
		>
{
	_id: Schema.Types.ObjectId;
	amount: number;
	currency: CurrencyEnum;
	skinId?: string;
	moneyType: string;
	openingBalance: number;
	closingBalance: number;
	details: ITransactionDetailsForPayments | ITransactionDetailsForGames;
	isTransactionSuccess: boolean;
	player: Schema.Types.ObjectId;
	transactionType: TransactionEnum;

	constructor(transactionData: Partial<ITransaction>) {
		this._id = transactionData._id;
		this.player = transactionData.player;
		this.transactionType = transactionData.transactionType;
		this.details = transactionData.details;
		this.skinId = 'crashncash';
		this.isTransactionSuccess = transactionData.isTransactionSuccess;
		this.amount = transactionData.amount;
		this.currency = transactionData.currency;
		this.moneyType = transactionData.moneyType;
	}
}

export { Transaction };
