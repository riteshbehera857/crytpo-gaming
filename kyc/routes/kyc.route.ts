import { NextFunction, Request, Response, Router } from 'express';
import getLogger from '../../common/logger';
import { catchAsync } from '../../common/lib';
import KycController from '../controllers/kyc.controller';
import { Joi, Segments, celebrate } from 'celebrate';
import { verifyUser } from '../../common/middlewares/verfiyUser';
import { KycLog } from '../models/kycLog.model';

const route = Router();
const log = getLogger(module);

export default (app: Router) => {
	app.use('/kyc', route);

	/**
	 * @openapi
	 * /player/kyc:
	 *   post:
	 *     tags:
	 *       - Authentication
	 *     summary: Register a new user
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               email:
	 *                 type: string
	 *                 required: true
	 *               password:
	 *                 type: string
	 *                 required: true
	 *               name:
	 *                 type: string
	 *               scope:
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
	 *                 launchUrl:
	 *                   type: string
	 *                   description: The URL to launch the game.
	 */

	route.post(
		'/',
		verifyUser(),
		celebrate({
			// Validate the request body using Joi schema
			[Segments.BODY]: Joi.object({
				phoneNumber: Joi.number(),
				addressLine2: Joi.string().required(),
				addressLine1: Joi.string(),
				city: Joi.string().required(),
				state: Joi.string().required(),
				country: Joi.string().required(),
				zipCode: Joi.number().required(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the PlayerController
			const response = await KycController.createKyc(req, next);
			// Send the response
			return res.status(200).json(response);
		}),
	);

	/**
	 * @openapi
	 * /player/kyc/{id}:
	 *   put:
	 *     tags:
	 *       - Authentication
	 *     summary: Update KYC status by ID
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *         description: ID of the KYC request to update
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               status:
	 *                 type: string
	 *                 required: true
	 *                 description: The new status of the KYC request
	 *     responses:
	 *       '200':
	 *         description: KYC status updated successfully
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 // Define properties of the response object here
	 *       '400':
	 *         description: Bad request
	 *       '404':
	 *         description: Not found
	 *       '500':
	 *         description: Internal server error
	 */

	route.put(
		'/:id',
		verifyUser(),
		celebrate({
			// Validate the request body using Joi schema
			[Segments.BODY]: Joi.object({
				status: Joi.string().required(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the PlayerController
			const response = await KycController.updateKyc(req, next);
			// Send the response
			return res.status(200).json(response);
		}),
	);
};
