import { Router, NextFunction, Request, Response } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import PaymentController from '../controllers/payment.controller';
import Container from 'typedi';
import GiftonPaymentController from '../controllers/gifton.controller';

import { catchAsync } from '../../common/lib';
import { TransactionEnum } from '../../common/types/transaction';
import PaymentRequestLog from '../models/paymentRequestLog.model';

const router = Router();

const giftonPaymentController = Container.get(GiftonPaymentController);
const paymentController = Container.get(PaymentController);

export default (app: Router) => {
	// Define the route for deposit
	app.use('/deposit', router);

	/**
	 * @openapi
	 * /payment/deposit:
	 *   get:
	 *     tags:
	 *       - Payment
	 *     summary: Get deposits
	 *     responses:
	 *       '200':
	 *         description: Games fetched successfully
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 code:
	 *                   type: string
	 *                   description: The response code specific to the operation.
	 *                 message:
	 *                   type: string
	 *                   description: A human-readable message explaining the response.
	 *                 data:
	 *                   type: object
	 *                   description: Data object containing the list of games.
	 */

	router.get('/', paymentController.getDeposits);

	// POST endpoint for processing payments

	/**
	 * @openapi
	 * /payment/deposit:
	 *   post:
	 *     tags:
	 *       - Payment
	 *     summary: Process payment
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               userId:
	 *                 type: string
	 *               customerName:
	 *                 type: string
	 *               mobileNumber:
	 *                 type: string
	 *               amount:
	 *                 type: number
	 *               email:
	 *                 type: string
	 *                 format: email
	 *               transactionType:
	 *                 type: string
	 *                 enum: [DEPOSIT, WITHDRAW, REFUND,BONUS,INPLAY,BET,WIN]
	 *               skinId:
	 *                 type: string
	 *                 nullable: true
	 *               customerCode:
	 *                 type: string
	 *                 nullable: true
	 *               selection:
	 *                 type: string
	 *                 nullable: true
	 *               city:
	 *                 type: string
	 *                 nullable: true
	 *               state:
	 *                 type: string
	 *                 nullable: true
	 *               country:
	 *                 type: string
	 *                 nullable: true
	 *               zipCode:
	 *                 type: string
	 *                 nullable: true
	 *     responses:
	 *       '200':
	 *         description: Games fetched successfully
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 code:
	 *                   type: string
	 *                   description: The response code specific to the operation.
	 *                 message:
	 *                   type: string
	 *                   description: A human-readable message explaining the response.
	 *                 data:
	 *                   type: object
	 *                   description: Data object containing the list of games.
	 */
	router.post(
		'/',
		celebrate({
			[Segments.BODY]: Joi.object({
				userId: Joi.string().required(),
				customerName: Joi.string().required(),
				mobileNumber: Joi.string().required(),
				amount: Joi.number().required(),
				email: Joi.string().email().required(),
				transactionType: Joi.string().valid(
					...Object.values(TransactionEnum),
				),
				bonusCode: Joi.string().optional(),
				// // returnUrl: Joi.string().required().uri(),
				skinId: Joi.string().optional(),
				customerCode: Joi.string().optional(),
				selection: Joi.string().optional(),
				city: Joi.string().optional(),
				state: Joi.string().optional(),
				country: Joi.string().optional(),
				zipCode: Joi.string().optional(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the RuleController
			const response = await paymentController.processPayment(req, next);
			// Send the response
			return res.status(200).json(response);
		}),
	);

	/**
	 * @openapi
	 * /payment/deposit/capture-payment:
	 *   post:
	 *     tags:
	 *       - Payment
	 *     summary: Capture payment
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             // Define schema for the request body here
	 *     responses:
	 *       '200':
	 *         description: Games fetched successfully
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 code:
	 *                   type: string
	 *                   description: The response code specific to the operation.
	 *                 message:
	 *                   type: string
	 *                   description: A human-readable message explaining the response.
	 *                 data:
	 *                   type: object
	 *                   description: Data object containing the list of games.
	 */

	// Define route for capturing payment
	router.route('/capture-payment').post(
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the RuleController
			const response = await giftonPaymentController.capturePayment(
				req,
				next,
			);
			// Send the response
			return res.status(200).json(response);
		}),
	);

	router.get(
		'/transaction/:orderId',
		celebrate({
			[Segments.PARAMS]: Joi.object({
				orderId: Joi.string().required(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await paymentController.getTransactionByOrderId(
				req,
				res,
				next,
			);

			return res.status(200).json(response);
		}),
	);

	/**
	 * @openapi
	 * /payment/deposit/capture-failure:
	 *   post:
	 *     tags:
	 *       - Payment
	 *     summary: Capture payment failure
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             // Define schema for the request body here
	 *     responses:
	 *       '200':
	 *         description: Games fetched successfully
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 code:
	 *                   type: string
	 *                   description: The response code specific to the operation.
	 *                 message:
	 *                   type: string
	 *                   description: A human-readable message explaining the response.
	 *                 data:
	 *                   type: object
	 *                   description: Data object containing the list of games.
	 */

	router.route('/capture-failure').post(
		// celebrate({
		//   [Segments.BODY]: Joi.object().keys({
		//     upiId: Joi.string().required(),
		//     amount: Joi.string().required(),
		//     customerName: Joi.string().required(),
		//     custRefNo: Joi.string().required(),
		//     userId: Joi.string().required(),
		//     transactionId: Joi.string().required(),
		//     txnStatus: Joi.string().required(),
		//     txnTime: Joi.string().required(),
		//   }),
		// }),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the RuleController
			const response = await giftonPaymentController.capturePayment(
				req,
				next,
			);
			// Send the response
			return res.status(200).json(response);
		}),
	);

	/**
	 * @openapi
	 * /payment/deposit/capture-cancel:
	 *   post:
	 *     tags:
	 *       - Payment
	 *     summary: Capture payment cancellation
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             // Define schema for the request body here
	 *     responses:
	 *       '200':
	 *         description: Games fetched successfully
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 code:
	 *                   type: string
	 *                   description: The response code specific to the operation.
	 *                 message:
	 *                   type: string
	 *                   description: A human-readable message explaining the response.
	 *                 data:
	 *                   type: object
	 *                   description: Data object containing the list of games.
	 */

	router.route('/capture-cancel').post(
		// celebrate({
		//   [Segments.BODY]: Joi.object().keys({
		//     upiId: Joi.string().required(),
		//     amount: Joi.string().required(),
		//     customerName: Joi.string().required(),
		//     custRefNo: Joi.string().required(),
		//     userId: Joi.string().required(),
		//     transactionId: Joi.string().required(),
		//     txnStatus: Joi.string().required(),
		//     txnTime: Joi.string().required(),
		//   }),
		// }),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the RuleController
			const response = await giftonPaymentController.capturePayment(
				req,
				next,
			);
			// Send the response
			return res.status(200).json(response);
		}),
	);
};
