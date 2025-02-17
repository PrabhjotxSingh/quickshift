import { AutoMap } from "@automapper/classes";
import { Location } from "../../models/location";

export class CreateJobRequest {
  @AutoMap()
  name!: string;
  @AutoMap()
  description!: string;
  @AutoMap()
  company!: string;
  @AutoMap()
  tags!: string[];
  @AutoMap()
  startTime!: Date;
  @AutoMap()
  endTime!: Date;
  @AutoMap()
  pay!: number;
  @AutoMap()
  location!: Location;
}
