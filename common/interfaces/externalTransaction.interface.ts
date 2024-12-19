import { Model } from 'mongoose';
import { CurrencyEnum } from '../types/currency';
import { TransactionEnum } from '../types/transaction';

interface IExternalTransaction {
	userId: string;
	amount: number;
	customerId: string;
	currency: CurrencyEnum;
	transactionType: TransactionEnum;
	details: {
		// requestUuid: string;
		paymentGateway: string;
		amountWithCommission: number;
		orderId: string;
		paymentTransactionId: string;
	};
	isTransactionSuccess: boolean;
	reasonOfFailure: {
		errorCode: string;
		errorName: string;
		errorDesc: string;
	};
}

interface IExternalTransactionQueryHelpers {}

interface IExternalTransactionModel
	extends Model<IExternalTransaction, IExternalTransactionQueryHelpers> {}

export {
	IExternalTransaction,
	IExternalTransactionQueryHelpers,
	IExternalTransactionModel,
};
