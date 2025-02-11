import { UserDto } from "../../models/user.dto";
export interface LoginResponse {
    refreshToken?: string;
    accessToken?: string;
    user?: UserDto;
}
