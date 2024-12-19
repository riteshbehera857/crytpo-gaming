import { Model, Schema } from 'mongoose';
import { CurrencyEnum } from '../types/currency';
import { TransactionEnumPayment } from '../types/transaction';

interface IAccountDetail {
	accountNo: string;
	ifc: string;
	bankName: string;
}
interface IPaymentTransaction {
	_id?: Schema.Types.ObjectId;
	paymentGateway: string;
	note: string;
	userId: Schema.Types.ObjectId;
	status: any;
	currency?: CurrencyEnum;
	amount: number;
	transactionType: TransactionEnumPayment;
	accountDetail: IAccountDetail;
	responseId: string;
	requestId: string;
	deletedAt: Date;
	amountWithCommission: number;
	createdAt: Date;
	updatedAt: Date;
}

interface TransactionQueryHelpers {}

interface ITransactionModel
	extends Model<IPaymentTransaction, TransactionQueryHelpers> {}

export {
	IPaymentTransaction,
	TransactionQueryHelpers,
	ITransactionModel,
	IAccountDetail,
};
