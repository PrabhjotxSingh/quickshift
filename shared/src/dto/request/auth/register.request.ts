import { AutoMap } from "@automapper/classes";

export class RegisterRequest {
  @AutoMap()
  Username!: string;

  @AutoMap()
  Password!: string;

  @AutoMap()
  Email!: string;

  @AutoMap()
  Birthday!: Date;

  @AutoMap()
  FirstName!: string;

  @AutoMap()
  LastName!: string;
}
