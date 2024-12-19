import Container, { Service } from "typedi";
import config from "../../common/config/envConfig";
import getLogger from "../../common/logger";
import { UserProfile } from "../../common/interfaces/player.interface"; 
import { TokenResponse } from "../../common/types/tokenResponse";

/**
 * Service for handling Google authentication.
 * This service is responsible for managing the authentication process
 * for users who signup/login via Google. It exchanges authorization codes
 * for access tokens and retrieves user profile information from Google.
 * The user profile is represented as a Player in the system.
 */
@Service('GoogleAuthenticationService')
class GoogleAuthenticationService {
    private logger = getLogger(module);

    /**
     * Handles Google authentication based on the provided code and type.
     * @param code - The authorization code or access token from Google.
     * @param codeType - The type of code ('CODE' or 'ACCESS_TOKEN').
     * @returns User profile retrieved from Google.
     * @throws Error if the code type is unsupported.
     */
    async handleAuthentication(code: string, codeType: string): Promise<UserProfile> {
        this.logger.info("Handling Google Auth");

        let userProfile: UserProfile;

        try {
            if (codeType === 'CODE') {
                const accessToken = await this.exchangeCodeForAccessToken(code);
                userProfile = await this.fetchUserProfileUsingAccessToken(accessToken);
            } else if (codeType === 'ACCESS_TOKEN') {
                userProfile = await this.fetchUserProfileUsingAccessToken(code);
            } else {
                this.logger.error(`Unsupported code type: ${codeType}`);
                throw new Error(`Unsupported code type: ${codeType}`);
            }

            this.logger.info("User profile retrieved successfully", JSON.stringify({ id: userProfile.id }));
            return userProfile;
        } catch (error) {
            this.logger.error("Error handling Google Auth", error);
            throw error; // Rethrow the error to be handled by the caller
        }
    }

    /**
     * Exchanges the authorization code for an access token.
     * @param code - The authorization code from Google.
     * @returns Access token.
     * @throws Error if the exchange fails.
     */
    private async exchangeCodeForAccessToken(code: string): Promise<string> {
        const { clientId, clientSecret, redirectUri } = config.oAuth.google;
        const tokenUrl = 'https://oauth2.googleapis.com/token';
        const tokenRequestData = {
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        };

        const stringifiedData = new URLSearchParams(tokenRequestData).toString();

        try {
            const response = await fetch(tokenUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: stringifiedData,
            });

            if (!response.ok) {
                this.logger.error("Error exchanging Google code", response?.statusText);
                throw new Error(`Failed to exchange Google code: ${response?.statusText}`);
            }

            const tokenResponse: TokenResponse = await response.json();
            this.logger.info("Access token retrieved successfully", { accessToken: tokenResponse.access_token });
            return tokenResponse.access_token;
        } catch (error) {
            this.logger.error("Error in token exchange", error);
            throw error; // Rethrow to propagate the error
        }
    }

    /**
     * Fetches the user profile using the provided access token.
     * @param accessToken - The access token for Google API.
     * @returns User profile information.
     * @throws Error if fetching the profile fails.
     */
    private async fetchUserProfileUsingAccessToken(access_token: string): Promise<UserProfile> {
        const profileUrl = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json";

        try {
            const response = await fetch(profileUrl, {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                },
            });

            if (!response.ok) {
                this.logger.error(`Failed to fetch Google user profile: ${response.statusText}`);
                throw new Error(`Failed to fetch Google user profile: ${response.statusText}`);
            }

            const userProfile: UserProfile = await response.json();
            this.logger.info("User profile fetched successfully", { userProfile: JSON.stringify(userProfile) });
            return userProfile;
        } catch (error) {
            this.logger.error("Error fetching user profile", error);
            throw error; // Rethrow to propagate the error
        }
    }
}

// Register the GoogleAuthenticationService with Typedi
Container.set(GoogleAuthenticationService.name, new GoogleAuthenticationService());
export default GoogleAuthenticationService;