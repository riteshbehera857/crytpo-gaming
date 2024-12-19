import { Request, Response, NextFunction } from 'express';
import Container, { Service } from 'typedi';
import { PaymentService } from '../services/payment.service';
import { catchAsync } from '../../common/lib';
import { ManualWithdrawalService } from '../services/manualWithdrawal.service';
import {
	PaymentDetails,
	UpdateDetailsBody,
} from '../../common/interfaces/payment.service.interface';
import { PaymentDetailsClass } from '../../common/classes/paymentProcessing.class';
import { UpdateDetailsBodyClass } from '../../common/classes/updateManualRefund';
import getLogger from '../../common/logger';
import { IPaymentWithdrawalRequestLog } from '../../common/interfaces/paymentWithdrawalRequestLog.interface';
import { TransactionStatusEnum } from '../../common/types/transactionStatus';

@Service()
class WithdrawalController {
	private static log = getLogger(module);
	public static async processWithdrawal(req: Request, next: NextFunction) {
		// Log the API call details (excluding the password for security)
		this.log.debug(
			'Calling api /payment/withdrawal with body: ' +
				JSON.stringify({ ...req.body }),
		);
		const paymentService = Container.get(PaymentService);
		try {
			const openingBalance = req.currentUser.currentBalance;
			const closingBalance =
				req.currentUser.currentBalance - req.body.amount;

			const withdrawalData: Partial<IPaymentWithdrawalRequestLog> = {
				user: req.currentUser._id,
				openingBalance: openingBalance,
				closingBalance: closingBalance,
				requestData: {
					amount: req.body.amount,
					customerName: req.currentUser.name,
					email: req.currentUser.email,
					mobileNumber: parseInt(req.currentUser.phoneNumber),
					userId: req.currentUser._id as unknown as string,
					bankDetail: {
						accountNumber: req.currentUser.bankDetails[0].accountNumber,
						accountName: req.currentUser.bankDetails[0].accountName,
						bankName: req.currentUser.bankDetails[0].bankName,
						ifscCode: req.currentUser.bankDetails[0].ifscCode,
						bankBranch: req.currentUser.bankDetails[0].bankBranch,
					},
				},
				skinId: req.body.skinId,
			};

			const response =
				await paymentService.processWithdrawal(withdrawalData);

			return response;
		} catch (error) {
			next(error);
		}
	}

	public static async getWithdrawal(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		try {
			const paymentService = Container.get(ManualWithdrawalService);
			const payment = await paymentService.getWithdrawal();
			res.status(200).json(payment);
		} catch (error) {
			next(error);
		}
	}

	public static async manualWithdrawal(req: Request, next: NextFunction) {
		try {
			const paymentService = Container.get(ManualWithdrawalService);
			const data: UpdateDetailsBody = { ...req.body };
			const newWithdrawal = new UpdateDetailsBodyClass(data);

			const payment = await paymentService.manualWithdrawal(newWithdrawal);
			return payment;
		} catch (error) {
			next(error);
		}
	}
}

export default WithdrawalController;
