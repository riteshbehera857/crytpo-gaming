import { Express, Request, Response } from 'express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { version } from '../package.json';
import basicAuth from 'express-basic-auth';
import getLogger from '../common/logger';
import config from '../common/config';

const log = getLogger(module);

const options: swaggerJsDoc.Options = {
	definition: {
		openapi: '3.1.0',
		info: {
			title: 'Platform Core API Docs',
			version,
			description: 'Platform core api documentation',
		},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					in: 'header',
					name: 'Authorization',
					description: 'Bearer token to access these api endpoints',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
		servers: [
			{
				url: `http://localhost:${config.port}/api/`,
			},
		],
	},
	apis: [
		'core/routes/*.ts',
		'payment/routes/*.ts',
		'wallet/routes/*.ts',
		'common/loaders/express.ts',
	],
};

const swaggerSpec = swaggerJsDoc(options);

function swaggerDocs(app: Express, port: number) {
	// Define your hardcoded username and password
	const basicAuthUser = config.basicAuth.username!;
	const basicAuthPassword = config.basicAuth.password!;
	const users = {
		[basicAuthUser!]: basicAuthPassword,
	};

	// Basic Authentication middleware
	const basicAuthMiddleware = basicAuth({
		users,
		challenge: true,
		unauthorizedResponse: 'You are not authorize for this page.',
	});
	// Swagger page
	app.use(
		'/docs',
		basicAuthMiddleware,
		swaggerUi.serve,
		swaggerUi.setup(swaggerSpec),
	);

	// Docs in JSON format
	app.get('docs.json', (req, res, next) => {
		res.setHeader('Content-Type', 'application/json');
		res.send();
	});

	log.info(`Docs available at http://localhost:${port}/docs`);
}

export default swaggerDocs;
