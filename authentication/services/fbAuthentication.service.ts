import Container, { Service } from "typedi";
import config from "../../common/config/envConfig";
import getLogger from "../../common/logger";
import { UserProfile } from "../../common/interfaces/player.interface"
import { TokenResponse } from "../../common/types/tokenResponse"

/**
 * Service for handling Facebook authentication.
 * This service is responsible for authenticating users through Facebook,
 * exchanging authorization codes for access tokens, and fetching user profiles.
 * The user profile is represented as a Player in the system.
 */

@Service()
class FBAuthenticationService {
    private logger = getLogger(module);

    /**
     * Handles Facebook authentication based on the provided code and type.
     * @param code - The authorization code or access token from Facebook.
     * @param type - The type of code ('CODE' or 'ACCESS_TOKEN').
     * @returns User profile retrieved from Facebook.
     * @throws Error if the code type is unsupported.
     */
    async handleAuthentication(code: string, type: string): Promise<UserProfile> {
        this.logger.info("Handling Facebook Auth");

        let userProfile: UserProfile;

        try {
            if (type === 'CODE') {
                const accessToken = await this.exchangeCodeForAccessToken(code);
                userProfile = await this.fetchUserProfileUsingAccessToken(accessToken);
            } else if (type === 'ACCESS_TOKEN') {
                userProfile = await this.fetchUserProfileUsingAccessToken(code);
            } else {
                this.logger.error(`Unsupported code type: ${type}`);
                throw new Error(`Unsupported code type: ${type}`);
            }
            this.logger.info("User profile retrieved successfully", { id: userProfile.id });
            return userProfile;
        } catch (error) {
            this.logger.error("Error handling Facebook Auth", error);
            throw error;
        }
    }

    /**
     * Exchanges the authorization code for an access token.
     * @param code - The authorization code from Facebook.
     * @returns Access token.
     * @throws Error if the exchange fails.
     */
    private async exchangeCodeForAccessToken(code: string): Promise<string> {
        const { clientId, clientSecret, redirectUri } = config.oAuth.facebook;
        const tokenUrl = 'https://graph.facebook.com/v20.0/oauth/access_token';
        const tokenRequestData = {
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
        };

        const stringifiedData = new URLSearchParams(tokenRequestData).toString();

        try {
            const response = await fetch(tokenUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: stringifiedData,
            });

            if (!response.ok) {
                this.logger.error(`Failed to exchange Facebook code: ${response.statusText}`);
                throw new Error(`Failed to exchange Facebook code: ${response.statusText}`);
            }

            const tokenResponse: TokenResponse = await response.json();
            return tokenResponse.access_token;
        } catch (error) {
            this.logger.error("Error in token exchange", error);
            throw error;
        }
    }

    /**
     * Builds the URL for fetching the user's profile from Facebook using the access token.
     * @param accessToken - The access token for Facebook API.
     * @returns A formatted URL for fetching the user profile.
     */
    private buildProfileUrl(accessToken: string): string {
        return `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`;
    }

    /**
     * Fetches the user profile using the provided access token.
     * @param accessToken - The access token for Facebook API.
     * @returns User profile information.
     * @throws Error if fetching the profile fails.
     */
    private async fetchUserProfileUsingAccessToken(accessToken: string): Promise<UserProfile> {
        const profileUrl = this.buildProfileUrl(accessToken);

        try {
            const response = await fetch(profileUrl);
            if (!response.ok) {
                this.logger.error(`Failed to fetch Facebook user profile: ${response.statusText}`);
                throw new Error(`Failed to fetch Facebook user profile: ${response.statusText}`);
            }

            const userProfile: UserProfile = await response.json();
            this.logger.info("User profile fetched successfully", JSON.stringify(userProfile));
            return userProfile;
        } catch (error) {
            this.logger.error("Error fetching user profile", error);
            throw error;
        }
    }
}

// Register the FBAuthenticationService with Typedi
Container.set(FBAuthenticationService.name, new FBAuthenticationService());
export { FBAuthenticationService }