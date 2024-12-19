import { celebrate, Joi, Segments } from 'celebrate';
import { NextFunction, Request, Response, Router } from 'express';
import middlewares from './../../common/middlewares';
import getLogger from '../../common/logger';
import { RoleEnum } from '../../common/types/role';
import { catchAsync } from '../../common/lib';
import PlayerController from '../controllers/player.controller';
import { UpdatePlayerRegistrationDetailsByEnum } from '../../common/types/updatePlayerRegistrationBy';

const route = Router();
const log = getLogger(module);

export default (app: Router) => {
	app.use('/player', route);

	/**
	 * @openapi
	 * /core/player/me:
	 *   get:
	 *     tags:
	 *       - User
	 *     summary: Get current user.
	 *     parameters:
	 *       - in: header
	 *         name: withdrawId
	 *         required: true
	 *         schema:
	 *           type: number
	 *     responses:
	 *       '200':
	 *         description: Game launch URL fetched successfully
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
	 */

	// Add more properties as needed
	// Define a route for retrieving the current user information
	route.get(
		'/me',
		celebrate({
			// Validate the request headers using Joi schema
			[Segments.HEADERS]: Joi.object({
				authorization: Joi.string().required(),
			}).unknown(),
		}),
		// Apply middleware to check if the user is authenticated
		// middlewares.isAuth,
		// // Apply middleware to attach the current user to the request
		// middlewares.attachCurrentUser,
		// Handle the logic for retrieving and responding with the current user information
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await PlayerController.getCurrentUser(req, res, next);
			// Send the JSON response with the current user information and a 200 status code
			return res.json(response).status(200);
		}),
	);
	/**
	 * @openapi
	 * /core/player/recent-payment-request:
	 *   get:
	 *     tags:
	 *       - Payment
	 *     summary: Get recent payment request.
	 *     parameters:
	 *       - in: header
	 *         name: authorization
	 *         required: true
	 *         schema:
	 *           type: string
	 *     responses:
	 *       '200':
	 *         description: Game launch URL fetched successfully
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
	 */

	route.get(
		'/recent-payment-request',
		celebrate({
			// Validate the request headers using Joi schema
			[Segments.HEADERS]: Joi.object({
				authorization: Joi.string().required(),
			}).unknown(),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await PlayerController.getRecentPaymentRequest(
				req,
				res,
				next,
			);

			return res.status(200).json(response);
		}),
	);

	/**
	 * @openapi
	 * /core/player/update:
	 *   patch:
	 *     tags:
	 *       - Player
	 *     summary: Update player registration details.
	 *     parameters:
	 *       - in: query
	 *         name: updateBy
	 *         required: true
	 *         schema:
	 *           type: string
	 *         enum: [EMAIL, IS_ACTIVE, ROLE, REFERRED_BY, BALANCE, PHONE_NUMBER, ADDRESS_LINE1, ADDRESS_LINE2, PASSWORD, NAME, CITY, STATE, COUNTRY, ZIP_CODE]
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               email:
	 *                 type: string
	 *                 format: email
	 *               isActive:
	 *                 type: boolean
	 *               role:
	 *                 type: string
	 *                 enum: [ADMIN, USER]
	 *               referredBy:
	 *                 type: string
	 *                 format: hexadecimal
	 *                 minLength: 24
	 *                 maxLength: 24
	 *               balance:
	 *                 type: object
	 *                 properties:
	 *                   currentBalance:
	 *                     type: number
	 *                   withdrawalBalance:
	 *                     type: number
	 *                   bonusBalance:
	 *                     type: number
	 *                   inPlayBalance:
	 *                     type: number
	 *               phoneNumber:
	 *                 type: number
	 *               addressLine1:
	 *                 type: string
	 *               addressLine2:
	 *                 type: string
	 *               password:
	 *                 type: string
	 *               name:
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
	 *         description: Game launch URL fetched successfully
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
	 */

	route.patch(
		'/update',
		celebrate({
			[Segments.QUERY]: Joi.object({
				updateBy: Joi.string().valid(
					...Object.values(UpdatePlayerRegistrationDetailsByEnum),
				),
			}),
			[Segments.BODY]: Joi.object({
				email: Joi.string().email().optional(),
				isActive: Joi.boolean().optional(),
				role: Joi.string()
					.valid(...Object.values(RoleEnum))
					.optional(),
				referredBy: Joi.string().hex().length(24).optional(),
				balance: Joi.object({
					currentBalance: Joi.number().optional(),
					withdrawalBalance: Joi.number().optional(),
					bonusBalance: Joi.number().optional(),
					inPlayBalance: Joi.number().optional(),
				}).optional(),
				phoneNumber: Joi.number().optional(),
				bankDetail: Joi.object({
					bankName: Joi.string().optional(),
					bankBranch: Joi.string().optional(),
					accountName: Joi.string().optional(),
					accountNumber: Joi.string().optional(),
					ifscCode: Joi.string().optional(),
				}),
				addressLine1: Joi.string().optional(),
				addressLine2: Joi.string().optional(),
				password: Joi.string().optional(),
				name: Joi.string().optional(),
				city: Joi.string().optional(),
				state: Joi.string().optional(),
				country: Joi.string().optional(),
				zipCode: Joi.string().optional(),
				// source: Joi.string().optional(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response =
				await PlayerController.updatePlayerRegistrationDetails(
					req,
					res,
					next,
				);

			res.status(200).json(response);
		}),
	);

	route.get(
		'/get-primary-bank',
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await PlayerController.getPrimaryBank(req, res, next);

			return res.status(200).json(response);
		}),
	);
};
