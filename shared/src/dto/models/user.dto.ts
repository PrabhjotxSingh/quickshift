import { AutoMap } from "@automapper/classes";
import { UserRole } from "../../enum/user-role.enum";

export class UserDto {
  @AutoMap()
  _id!: string;

  @AutoMap()
  id!: string;

  @AutoMap()
  email!: string;

  @AutoMap()
  username!: string;

  @AutoMap()
  password!: string;

  @AutoMap()
  firstName!: string;

  @AutoMap()
  lastName!: string;

  @AutoMap()
  roles!: UserRole[];

  @AutoMap()
  skills!: string[];
}
