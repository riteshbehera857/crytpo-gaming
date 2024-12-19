import 'reflect-metadata'; // We need this in order to use @Decorators
import express, { Express } from 'express';
import path from 'path';
import logger from './common/logger';
import config from './common/config';
import { connect } from './common/config/db';
import AppLoader from './common/loaders';
import { Server as SocketServer } from 'socket.io';
// import { SocketService } from './common/loaders/socket';
import Container from 'typedi';
import { createServer, Server as HttpServer } from 'http';
import redis, { createClient } from 'redis';
import { channel } from 'diagnostics_channel';
import { QueueProcessor } from './notifications/processors';
import { redisService } from './core/services/redis.service';
import {deposit,withdraw,updateBalance,getBalance} from './crypto/controllers/depositcontroller';


const log = logger(module);

class Server {
	private app: Express;
	io: SocketServer;

	// private socketService: SocketService;
	private httpServer: HttpServer; // Declare HTTP server instance

	private queueProcessor: QueueProcessor;

	// private betAmountBucketOrderConfigDao: BetAmountBucketOrderConfigDao;

	constructor() {
		this.app = express();
		// this.socketService = new SocketService(this.app);
		this.httpServer = createServer(this.app); // Create HTTP server
		// this.io = this.socketService.io;

		this.io = new SocketServer(this.httpServer);

		// this.betAmountBucketOrderConfigDao = new BetAmountBucketOrderConfigDao(); // Initialize BetAmountBucketOrderConfigDao instance

		// Configure Redis connection details

		// this.redisClient = createClient();

		this.queueProcessor = new QueueProcessor();

		this.app.use(
			'/downloads',
			express.static(path.join(__dirname, 'downloads')),
		);
	}

	// private async connectRedisClient() {
	// 	this.redisClient.on('error', (err) => {
	// 		log.error('Redis client error: ', err);
	// 	});

	// 	log.info('Connecting to redis client...');
	// 	await this.redisClient.connect();
	// 	log.info('Connected to redis client');
	// 	this.subscribeService.subscribeEvent();
	// }

	private async start(): Promise<void> {
		const appLoader = new AppLoader(this.app, this.httpServer);
		await appLoader.load();

		const DB_URL = config.mongo.URL?.replace(
			'<USERNAME>',
			config.mongo.user!,
		).replace('<PASSWORD>', config.mongo.pass!) as string;

		const conn = await connect(DB_URL, config.mongo.dbName!);
		
		log.info(`Platform db is running on host ${conn?.connection.host}`);

		redisService.connect();

		// const { server } = this.socketService;

		// await this.connectRedisClient();

		await this.queueProcessor.subscribe();

		this.httpServer
			.listen(config.port, () => {
				log.info(`
${process.env.NODE_ENV} Platform is running at http://localhost:${config.port} 🛡️
      `);
			})
			.on('error', (err) => {
				console.log(err);
				log.error(err);
				process.exit(1);
			});
	}

	public async initialize(): Promise<void> {
		try {
			await this.start();
		} catch (error) {
			console.log({ error });
			log.error('Error starting server:', error);
			process.exit(1);
		}
	}
}

const server = new Server();

const { io } = server;

server.initialize();

export { io, server };
