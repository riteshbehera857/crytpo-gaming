/**
 * Controller for handling social authentication.
 */
import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/user.service';
import config from "../../common/config/envConfig"
import Container from 'typedi';
import getLogger from '../../common/logger';
import { AuthSource } from '../../common/config/constants';

export default class SocialAuthController {
    private static log = getLogger(module);

    /**
     * Handles social authentication for users by registering them & managing session.
     * @param req - Express request object, containing the body with `code`, `codeType`, and `deviceId`.
     * @param next - Express next function for error handling.
     * @returns Response Object with success, message, jwtToken, and user data or error.
     */
    public static async handleSocialAuth(req: Request, next: NextFunction) {
        try {
            console.log("---- API Called -----");
            const { code, codeType, deviceId } = req.body;
            const { authProvider } = req.query;
            const userService = new UserService();

            const socialAuthServiceName = config.authServiceMap[authProvider as keyof typeof config.authServiceMap];

            // Dynamically retrieve the appropriate service class based on the authProvider.
            const dynamicAuthService = Container.get<any>(socialAuthServiceName);

            // Retrieve user information from the authentication provider using the provided code and code type.
            const retrievedUserInfoFromAuthProvider = await dynamicAuthService.handleAuthentication(code, codeType);

            // Registers the user in the database, creates a session, and generates a JWT token.
            // 1. Store the user's information in the database.
            // 2. Create a session for the user.
            // 3. Generate a JWT token for authenticating future requests.
            const registeredUserWithJWT = await userService.registerUser(retrievedUserInfoFromAuthProvider, authProvider as AuthSource.GOOGLE | AuthSource.FACEBOOK, deviceId);

            return {
                message: "Authentication successful",
                success: true,
                jwtToken: registeredUserWithJWT.jwt,
                savedUser: registeredUserWithJWT.player
            }
        } catch (error) {
            this.log.error('🔥 error in handling social authentication: ' + error?.message);
            return next(error)
        }
    }
}

