import { AutoMap } from "@automapper/classes";

export class CompanyDto {
  @AutoMap()
  id!: string;
  @AutoMap()
  name!: string;
  @AutoMap()
  description!: string;
  @AutoMap()
  owner!: string;
  @AutoMap()
  companyAdmins!: string[];
}
