// import { PassportStatic } from 'passport';
// import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
// import jwt from 'jsonwebtoken';
// const passport: PassportStatic = require('passport');
// import axios from 'axios';
// import config from '../config/index';
// // JWT Strategy
// const jwtOptions = {
// 	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
// 	secretOrKey: config.jwtSecret, // Replace with your actual JWT secret key
// };

import { Request, Response, NextFunction } from 'express';
import { RoleEnum } from '../types/role';
import { Response as ApiResponse } from '../config/response';
import { ResponseCodes } from '../config/responseCodes';

// passport.use(
// 	new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
// 		try {
// 			let user = null;

// 			try {
// 				const response = await axios.get(
// 					`http://${config.userServerHost}:9090/affiliate/user/${jwtPayload.sub}`,
// 				);

// 				user = response.data;
// 			} catch (error) {
// 				return done(null, false);
// 			}
// 			if (!user) {
// 				return done(null, false);
// 			}

// 			return done(null, user);
// 		} catch (err) {
// 			return done(err);
// 		}
// 	}),
// );

// passport.serializeUser((user: User, done) => {
// 	done(null, user.id);
// });

// passport.deserializeUser(async (id: string, done) => {
// 	try {
// 		let user = null;
// 		try {
// 			const response = await axios.get(
// 				`http://${config.userServerHost}:9090/affiliate/user/${id}`,
// 			);
// 			user = response.data;
// 		} catch (error) {
// 			return done(null, false);
// 		}
// 		done(null, user.role);
// 	} catch (err) {
// 		done(err);
// 	}
// });

// // Function to sign JWT
// export const signJwt = (user: User): string => {
// 	const token = jwt.sign(
// 		{ sub: user.id, username: user.username },
// 		config.jwtSecret,
// 		{ expiresIn: config.loginJWTExpiry },
// 	);
// 	return token;
// };

const checkPermission =
	(requiredRole: string[], requiredPermission?: string[]) =>
	(req: Request, res: Response, next: NextFunction) => {
		const user = req.currentUser;

		// Check if user is logged in
		if (!user) {
			const resp = new ApiResponse(
				ResponseCodes.AUTHORIZATION_FAILED.code,
				ResponseCodes.AUTHORIZATION_FAILED.message,
			);
			return res.status(200).json(resp);
		}

		if (
			user.role && requiredRole.length !== 0
				? true
				: requiredRole.includes(user.role)
		) {
			// Check if user has the required permission
			if (user.role === RoleEnum.ADMIN) {
				// User has the required role and permission
				next();
			} else {
				const resp = new ApiResponse(
					ResponseCodes.PERMISSION_DENIED.code,
					ResponseCodes.PERMISSION_DENIED.message,
				);
				return res.status(200).json(resp);
			}
		}
	};

export { checkPermission };

// export default passport;
