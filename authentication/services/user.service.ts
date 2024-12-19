import { redisService } from "../../core/services/redis.service";
import { JwtService } from "../../core/services/jwt.service";
import getLogger from "../../common/logger";
import { PlayerDao } from "../../core/daos/player.dao";
import { AuthSource } from "../../common/config/constants";
import {UserProfile} from "../../common/interfaces/player.interface"

/**
 * UserService handles user registration for user who signed 
 * using social authentication platforms such as Google and Facebook.
 * This service manages the creation of player accounts, 
 * generates JWT tokens for authentication, and creates user sessions in Redis.
 * 
 * In this context, the term "user" is synonymous with "player"; both refer 
 * to the same entity in the system. The service utilizes the PlayerDao 
 * for interacting with the player data and the JwtService for token 
 * management.
 * 
 * @class UserService
 */

class UserService {
    private logger = getLogger(module);
    private playerDao: PlayerDao;
    private jwtService: JwtService;

    constructor() {
        this.jwtService = new JwtService();
        this.playerDao = new PlayerDao();
    }

    /**
     * Registers a user by creating their account, generating a JWT token,
     * and creating a session in Redis.
     * @param userProfile - The profile information of the user from the auth provider.
     * @param authProvider - The social auth provider (e.g., 'google', 'facebook').
     * @param deviceId - The ID of the device used for registration.
     * @returns An object containing the generated JWT and saved user information.
     * @throws Error if user registration fails.
     */
    public async registerUser(userProfile: UserProfile, authProvider: AuthSource.GOOGLE | AuthSource.FACEBOOK, deviceId: string): Promise<any> {
        this.logger.info("Registering user", JSON.stringify({ email: userProfile.email }));

        try {
            const player = await this.playerDao.createPlayerWithSocialAuth(userProfile, authProvider)
            this.logger.info("User created successfully");

            const jwt = this.jwtService.generateToken({
                playerId: player._id.toString(),
                email: player.email,
                deviceId: deviceId
            });
            this.logger.info("JWT generated successfully", { jwt });

            const createdUserSession = await redisService.createSession({ userId: player._id, phoneNumber: player.email || player.socialProviderId, deviceId });
            this.logger.info("User session created successfully", createdUserSession);

            return {
                jwt,
                player
            };
        } catch (error) {
            this.logger.error("Error registering user", error);
            throw new Error("User registration failed");
        }
    }
}

export { UserService };
