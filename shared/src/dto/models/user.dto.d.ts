import { UserRole } from "../../enum/user-role.enum";
export declare class UserDto {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    roles: UserRole[];
    skills: string[];
}
