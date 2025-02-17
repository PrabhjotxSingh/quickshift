import { AutoMap } from "@automapper/classes";
import { Location } from "./location";

export class JobDto {
  @AutoMap()
  company!: string;
  @AutoMap()
  name!: string;
  @AutoMap()
  description!: string;
  @AutoMap()
  tags!: string[];
  @AutoMap()
  isOpen!: boolean;
  @AutoMap()
  startTime!: Date;
  @AutoMap()
  endTime!: Date;
  @AutoMap()
  pay!: number;
  @AutoMap()
  location!: Location;
}
