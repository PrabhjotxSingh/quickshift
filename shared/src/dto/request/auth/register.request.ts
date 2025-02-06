import { AutoMap } from "@automapper/classes";

export class RegisterRequest {
  @AutoMap()
  username!: string;

  @AutoMap()
  password!: string;

  @AutoMap()
  email!: string;

  @AutoMap()
  birthday!: Date;

  @AutoMap()
  firstName!: string;

  @AutoMap()
  lastName!: string;
}
