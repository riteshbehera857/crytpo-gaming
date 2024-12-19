import { NextFunction, Request, Response, Router } from 'express';
import { celebrate } from 'celebrate';
import { catchAsync } from '../../common/lib';
import SocialAuthController from '../controller/socialAuth.controller';
import { socialAuthValidation } from '../../common/schemas/socialAuthValidation.schema';

const router = Router();

/**
 * Social Authentication routes.
 * @param app - Express router instance.
 */
export default (app: Router) => {
    app.use('/', router);

    /**
     * Temporary route for testing purposes.
     * Returns a sample response to test route functionality.
     * @route GET /api/auth
     * @returns {Object} 200 - Test message and success status
     */
    router.get(
        '/',
        catchAsync(async (req: Request, res: Response, next: NextFunction) => {
            const response = { message: "Hello I am auth route", success: "success" }
            return res.status(200).json(response);
        })
    )

    /**
     * Social Authentication Route
     * Handles user authentication through social providers.
     * Validates incoming request body and query parameters for required fields and acceptable values,
     * then processes authentication, registration, and session management.
     * 
     * @route POST /api/auth/social-auth
     * @bodyparam {string} code - Authorization code from the social provider.
     * @bodyparam {string} codeType - Type of code provided (e.g., 'CODE' or 'ACCESS_TOKEN').
     * @bodyparam {string} deviceId - Unique identifier for the user's device.
     * @queryparam {string} authProvider - Social provider for authentication (e.g., 'google' or 'facebook').
     * @returns {Object} 200 - Authentication success message, JWT token, and user data on success.
     * @throws {422} - If validation fails due to missing or incorrect parameters.
     */
    router.post(
        '/social-auth',
        celebrate(socialAuthValidation),
        catchAsync(async (req: Request, res: Response, next: NextFunction) => {
            const response = await SocialAuthController.handleSocialAuth(req, next);
            return res.status(200).json(response);
        })
    )
}