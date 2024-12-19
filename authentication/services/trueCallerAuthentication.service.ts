import Container, { Service } from "typedi";
import config from "../../common/config/envConfig"


@Service()
class TrueCallerAuthenticationService {
    async handleAuthentication(code: string, type: string) {
        // Your logic to handle Truecaller authentication
        console.log("Handling Truecaller Auth with code:", code);
        // Implement Truecaller-specific auth logic
    }
}

Container.set(TrueCallerAuthenticationService.name, new TrueCallerAuthenticationService())
export { TrueCallerAuthenticationService }