import compression from 'compression';
import cors from 'cors';
import express, { Express, Request, Response, NextFunction } from 'express';
import morganMiddleware from '../logger/morgan';
import { isCelebrateError } from 'celebrate';
import '../../payment/seed/config.seed';
import getLogger from '../logger';
import config from '../config';
import swaggerDocs from '../../docs/swagger';
import CoreRoutes from './../../core/routes';
import WalletRoutes from './../../wallet/routes';
import PaymentRoutes from './../../payment/routes';
import UploadRoutes from './../../upload/routes';
import KycRoutes from '../../kyc/routes';
import DemoRoutes from '../../demo/routes';
import AuthRoutes from '../../authentication/routes'
import { Server as HttpServer } from 'http';
import { ErrorHandler } from '../lib';
import checkAuthAndAttachCurrentUser from '../middlewares/checkAuthAndAttachCurrentUser';
// import { initializeWebSocketServer } from './webSocket';
import Container from 'typedi';
import NotificationWatcher from '../../core/services/notification.watcher.service';
import "../../authentication/services/index"; // Adds social authentication services to Container(typedi)

const log = getLogger(module);

class ExpressLoader {
	private app: Express;
	private httpServer: HttpServer;

	constructor(app: Express, httpServer: HttpServer) {
		this.app = app;
		this.httpServer = httpServer;
	}

	private handleStatusRequests(req: Request, res: Response): void {
		res.status(200).end();
	}

	public async load(): Promise<void> {
		// initializeWebSocketServer(this.httpServer);

		Container.get(NotificationWatcher);
		// this.app.get('/status', this.handleStatusRequests);
		// this.app.get('/status', async (req, res) => {
		// 	const deviceService = Container.get(DeviceService);
		// 	await deviceService.registerDevice({
		// 		userId: '6659cd54bddceb90dbbba36f',
		// 		id: '6659cd54bddceb90dbbba36f',
		// 		name: '6659cd54bddceb90dbbba36f',
		// 		token: ['dd81BFot_qr5Wn4dTi-Bra:APA91bHkBM2Q5gieC7nYJQ14PLxBiEvsCUD6jNq9dnSa9g8wdiV29-xgqUx4ZGPxAA2FuDbDYQRjmcatd2UHmZ1JDPC_OP_vvvTI0yPM_QKJ_cVUA3kzpo4yXUg_TcwRo-OAQ0CiNHsz'],
		// 	});

		// 	const loginEvent: IMessage = {
		// 		type: EventTypes.WALLET,
		// 		subType: SubTypes.BET,
		// 		userId: '6659cd54bddceb90dbbba36f',
		// 		payload: {
		// 			playerId: '6659cd54bddceb90dbbba36f',
		// 			currentBalance: '500',
		// 			date: new Date(),
		// 		},
		// 	};
		// 	const publisherService = new PublisherService();

		// 	await publisherService.publishMessage(loginEvent, 'notification');
		// 	res.json({ status: 'OK' });
		// });
		// this.app.head('/status', this.handleStatusRequests);
		swaggerDocs(this.app, config.port);

		this.app.enable('trust proxy');
		this.app.use(cors());
		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: false }));
		this.app.use(compression());
		this.app.use(morganMiddleware);

		const coreRoutes = new CoreRoutes();
		const walletRoutes = new WalletRoutes();
		const paymentRoutes = new PaymentRoutes();
		const kycRoutes = new KycRoutes();
		const uploadRoutes = new UploadRoutes();
		const demoRoutes = new DemoRoutes();
		const authRoutes = new AuthRoutes();

		this.app.use('/api/external', paymentRoutes.getRouter());
		this.app.use('/api/internal/wallet', walletRoutes.getRouter());
		this.app.use('/api/internal', coreRoutes.getRouter());
		this.app.use('/api/auth', authRoutes.getRouter())

		this.app.use(checkAuthAndAttachCurrentUser);

		this.app.use('/api/core', coreRoutes.getRouter());
		this.app.use('/api/wallet', walletRoutes.getRouter());
		this.app.use('/api/payment', paymentRoutes.getRouter());
		this.app.use('/api/player', kycRoutes.getRouter());
		this.app.use('/api/upload', uploadRoutes.getRouter());

		this.app.use('/api/demo', demoRoutes.getRouter());

		// this.app.use(ErrorHandler.errorHandler);

		this.app.use((err, req, res, next) => {
			console.log({ err });
			// Check if err.details exists
			if (err.isOperational) {
				res.status(err.statusCode || 500).json({
					status_code: err.customErrorCode || 500,
					message: err.message || 'Internal Server Error',
					status: err.status || 'error',
				});
			}
			if (err.details) {
				// Handle Celebrate validation errors
				const validationError = err.details.get('body');
				console.log(err);
				const errorMessage = validationError
					? validationError.message
					: 'Validation error';
				res.status(422).json({ error: errorMessage });
			} else {
				// Handle other errors
				const statusCode = err.status || 500;
				res.status(statusCode).json({ error: err.message });
			}
		});

		// this.app.use(this.handleNotFound);
		// this.app.use(this.handleUnauthorizedError);
		// this.app.use(this.handleCelebrateErrors);
		// this.app.use(this.handleGeneralErrors);
	}
}

export { ExpressLoader };
