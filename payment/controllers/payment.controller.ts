import { Request, Response, NextFunction } from 'express';
import Container, { Service } from 'typedi';
import { PaymentService } from '../services/payment.service';
import { catchAsync } from '../../common/lib';
import { ManualWithdrawalService } from '../services/manualWithdrawal.service';
import { PaymentDetails } from '../../common/interfaces/payment.service.interface';
import { Config } from '../../common/classes/config.class';
import { PaymentDetailsClass } from '../../common/classes/paymentProcessing.class';
import { CurrencyEnum } from '../../common/types/currency';
import { TransactionEnum } from '../../common/types/transaction';
import { Logger } from 'winston';
import getLogger from '../../common/logger';
import { model } from 'mongoose';
import { TransactionService } from '../services/transaction.service';
@Service()
class PaymentController {
	private log: Logger;

	constructor() {
		this.log = getLogger(module);
	}

	public processPayment = async (req: Request, next: NextFunction) => {
		try {
			const paymentService = Container.get(PaymentService);

			const skin = req.body.skinId;
			const customerCode = req.body.customerCode;

			const customerData = customerCode
				? {
						...req.body,
						transactionType: TransactionEnum.DEPOSIT,
						currency: CurrencyEnum.INR,
						city: req.skillzUser.city,
						country: req.skillzUser.country,
						customerName: req.skillzUser.customerName,
						email: req.skillzUser.email,
						mobileNumber: req.skillzUser.mobileNumber,
						state: req.skillzUser.state,
						userId: req.skillzUser.userId,
						zipCode: req.skillzUser.zipCode,
					}
				: {};

			const data: PaymentDetails = customerCode
				? customerData
				: {
						...req.body,
						transactionType: TransactionEnum.DEPOSIT,
						currency: CurrencyEnum.INR,
					};

			const newPayment = new PaymentDetailsClass(
				data,
			) satisfies PaymentDetails;

			const payment = await paymentService.paymentProcessing(
				newPayment,
				skin,
				customerCode,
			);

			return payment;
		} catch (error) {
			next(error);
		}
	};

	public getTransactionByOrderId = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		this.log.debug(
			'Calling api /api/external/payment/transaction/:orderId with param: ' +
				JSON.stringify({ ...req.params }),
		);
		try {
			const transactionService = Container.get(TransactionService);

			const orderId = req.params.orderId;

			const response =
				await transactionService.getTransactionByOrderId(orderId);

			return response;
		} catch (error) {
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	};

	// public processWithdrawal = catchAsync(
	// 	async (req: Request, res: Response, next: NextFunction) => {
	// 		try {
	// 			const paymentService = Container.get(PaymentService);
	// 			const data: PaymentDetails = { ...req.body };
	// 			const newPayment = new PaymentDetailsClass(data);
	// 			const payment =
	// 				await paymentService.WithdrawalProcessing(newPayment);
	// 			res.status(200).json(payment);
	// 		} catch (error) {
	// 			next(error);
	// 		}
	// 	},
	// );

	public getWithdrawal = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			try {
				const paymentService = Container.get(ManualWithdrawalService);
				const payment = await paymentService.getWithdrawal();
				res.status(200).json(payment);
			} catch (error) {
				next(error);
			}
		},
	);
	public getDeposits = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			try {
				const paymentService = Container.get(PaymentService);
				const payment = await paymentService.getDeposits();
				res.status(200).json(payment);
			} catch (error) {
				next(error);
			}
		},
	);
}

export default PaymentController;
