import { AutoMap } from "@automapper/classes";

export class CreateCompanyRequest {
  @AutoMap()
  name!: string;
  @AutoMap()
  description!: string;
}
