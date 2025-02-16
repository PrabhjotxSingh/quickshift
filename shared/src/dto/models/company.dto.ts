import { AutoMap } from "@automapper/classes";

export class CompanyDto {
  @AutoMap()
  name!: string;
  @AutoMap()
  description!: string;
  @AutoMap()
  owner!: string;
}
