import { Server, Socket } from 'socket.io';
import http from 'http';
import { Service } from 'typedi';
import { Express } from 'express';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

const io = new Server();

@Service()
class SocketService {
	private app: Express;
	server: http.Server;
	io: Server;

	constructor(app: Express) {
		this.app = app;
		this.server = http.createServer();
		this.io = new Server(this.server, {
			cors: {
				origin: '*',
				methods: ['GET', 'POST'],
				credentials: true,
			},
		});

		this.io.on('connection', this.handleConnection);
	}

	public handleConnection(socket: Socket) {
		console.log('User connected with socket: ' + socket.id);

		socket.on('disconnect', () => {
			console.log('User disconnected');
		});
	}
}

export { SocketService };
