import { Model, Schema } from 'mongoose';
import { TransactionStatusEnum } from '../types/transactionStatus';
import { CurrencyEnum } from '../types/currency';

interface IPaymentDeposit {
	_id?: Schema.Types.ObjectId;
	paymentGateway: string;
	note: string;
	userId: Schema.Types.ObjectId;
	status: TransactionStatusEnum;
	currency: CurrencyEnum;
	amount: number;
	transactionType: string;
	responseId: string;
	requestId: string;
	walletAddress: string;
	deletedAt: Date;
	amountWithCommission: number;
	createdAt: Date;
	updatedAt: Date;

}

interface PaymentDepositQueryHelpers {}

type PaymentDepositModelType = Model<
	IPaymentDeposit,
	PaymentDepositQueryHelpers
>;

export { IPaymentDeposit, PaymentDepositQueryHelpers, PaymentDepositModelType };
