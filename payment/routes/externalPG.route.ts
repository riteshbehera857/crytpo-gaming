import { Joi, Segments, celebrate } from 'celebrate';
import { NextFunction, Request, Response, Router } from 'express';
import { catchAsync } from '../../common/lib';
import { ExternalPGController } from '../controllers/externalPG.controller';
import { TransactionEnum } from '../../common/types/transaction';
import Container from 'typedi';
import PaymentController from '../controllers/payment.controller';
import GiftonPaymentController from '../controllers/gifton.controller';
import { verifySkillzUser } from '../../common/middlewares/verifySkillzUser';

const route = Router();

export default (app: Router) => {
	app.use('/payment', route);

	/**
	 * @openapi
	 * /external/payment/auth:
	 *   post:
	 *     tags:
	 *       - External
	 *     summary: Authenticate user with external payment gateway
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               auth:
	 *                 type: string
	 *               channel:
	 *                 type: string
	 *               tz:
	 *                 type: string
	 *               skin:
	 *                 type: string
	 *               locale:
	 *                 type: string
	 *               client:
	 *                 type: string
	 *               design:
	 *                 type: string
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

	route.post(
		'/auth',
		celebrate({
			[Segments.BODY]: Joi.object({
				auth: Joi.string().required(),
				channel: Joi.string().required(),
				tz: Joi.string().required(),
				skin: Joi.string().required(),
				locale: Joi.string().required(),
				client: Joi.string().required(),
				design: Joi.string().required(),
				webview: Joi.any().required(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await ExternalPGController.authenticate(
				req,
				res,
				next,
			);

			res.status(200).json(response);
		}),
	);

	route.get(
		'/transaction/:orderId',
		celebrate({
			[Segments.PARAMS]: Joi.object({
				orderId: Joi.string().required(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await ExternalPGController.getTransactionByOrderId(
				req,
				res,
				next,
			);

			return res.status(200).json(response);
		}),
	);

	/**
	 * @openapi
	 * /external/payment/capture-payment:
	 *   post:
	 *     tags:
	 *       - External
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

	route.post(
		'/deposit/capture-payment',
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the RuleController
			const giftonPaymentController = Container.get(GiftonPaymentController);
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
	 * /external/payment/deposit:
	 *   post:
	 *     tags:
	 *       - External
	 *     summary: Process deposit transaction
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
	 *               transactionType:
	 *                 type: string
	 *                 enum: [DEPOSIT, WITHDRAW,REFUND,BONUS,INPLAY,BET,WIN]
	 *               skinId:
	 *                 type: string
	 *               customerCode:
	 *                 type: string
	 *               selection:
	 *                 type: string
	 *               city:
	 *                 type: string
	 *               state:
	 *                 type: string
	 *               country:
	 *                 type: string
	 *               zipCode:
	 *                 type: string
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

	route.post(
		'/deposit',
		verifySkillzUser(),
		celebrate({
			[Segments.BODY]: Joi.object({
				amount: Joi.number().required(),
				transactionType: Joi.string().valid(
					...Object.values(TransactionEnum),
				),
				// // returnUrl: Joi.string().required().uri(),
				skinId: Joi.string().optional(),
				customerCode: Joi.string().optional(),
				selection: Joi.string().optional(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the RuleController
			const paymentController = Container.get(PaymentController);
			const response = await paymentController.processPayment(req, next);
			// Send the response
			return res.status(200).json(response);
		}),
	);

	/**
	 * @openapi
	 * /external/payment/user:
	 *   get:
	 *     tags:
	 *       - External
	 *     summary: Get user by ID
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

	route.get(
		'/user',
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await ExternalPGController.getUserById(
				req,
				res,
				next,
			);

			res.status(200).json(response);
		}),
	);
};
