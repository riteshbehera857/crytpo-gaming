import Container from 'typedi';
import { ExternalPGService } from '../services/externalPG.service';
import { NextFunction, Request, Response } from 'express';
import getLogger from '../../common/logger';

class ExternalPGController {
	private static log = getLogger(module);

	private static externalPGService = Container.get(ExternalPGService);

	public static async authenticate(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		this.log.debug(
			'Calling api /auth with body: ' + JSON.stringify({ ...req.body }),
		);
		try {
			const authenticationData: Record<string, string> = {
				auth: req.body.auth,
				channel: req.body.channel,
				tz: req.body.tz,
				skin: req.body.skin,
				locale: req.body.locale,
				client: req.body.client,
				design: req.body.design,
			};

			const authenticationQuery: Record<string, string> = {
				...(req.query as unknown as Record<string, string>),
			};

			const response = await this.externalPGService.authenticate(
				authenticationData,
				authenticationQuery,
			);

			console.log('Controller Response ----------------------', {
				response,
			});

			return response;
		} catch (error) {
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}

	public static async getUserById(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		this.log.debug(
			'Calling api /user/ with query: ' + JSON.stringify({ ...req.query }),
		);
		try {
			const query = req.query as unknown as string;

			const response = await this.externalPGService.getUserById(query);

			return response;
		} catch (error) {
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}

	public static async getTransactionByOrderId(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		this.log.debug(
			'Calling api /api/external/payment/transaction/:orderId with param: ' +
				JSON.stringify({ ...req.params }),
		);
		try {
			const orderId = req.params.orderId;

			const response =
				await this.externalPGService.getTransactionByOrderId(orderId);

			console.log({ response });

			return response;
		} catch (error) {
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}
}

export { ExternalPGController };
