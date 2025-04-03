import { AutoMap } from "@automapper/classes";
import { Location } from "./location";

export class ShiftDto {
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
  @AutoMap()
  isComplete!: boolean;
  @AutoMap()
  rating?: number;
}
