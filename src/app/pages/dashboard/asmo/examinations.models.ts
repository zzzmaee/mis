import { formatDistance } from "date-fns";
import {Employee} from './user.models';

export class Examination {
  id: string;
  employee?: Employee;
  createdAt?: Date;
  updatedAt?: Date;
  closedAt?: Date;
  results?: ExaminationResult[];
  nurse?: any;
  status?: string;
  constructor(data: any) {
    this.id = data.id;
    Object.assign(this, data);
    this.employee = new Employee(data.employee);
    this.createdAt = new Date(data.createdAt);
    this.updatedAt = new Date(data.updatedAt);
    this.closedAt = new Date(data.closedAt);
    this.results = data.results.map((r: any) => new ExaminationResult(r));
  }
  getCreatedAtHourAndMinute(): string {
    return (
      this?.createdAt?.toLocaleTimeString("ru-RU", {
        hour: "numeric",
        minute: "numeric",
      }) || ""
    );
  }
  getClosedAtHourAndMinute(): string {
    return (
      this?.closedAt?.toLocaleTimeString("ru-RU", {
        hour: "numeric",
        minute: "numeric",
      }) || ""
    );
  }

  getTimeDifference(): string {
    if (this.closedAt && this.createdAt) {
      return formatDistance(this.closedAt.getTime(), this.createdAt.getTime());
    } else {
      return "";
    }
  }
}
export class ExaminationResult {
  id?: string;
  examinationId?: string;
  status?: string;
  result?: number;
  manualResult?: number;
  criteria?: string;
  selectedResultId?: string;
  selectedResultRu?: string;
  selectedResultKk?: string;
  createdAt?: Date;
  updatedAt?: Date;
  constructor(data: any) {
    Object.assign(this, data);
    this.createdAt = new Date(data?.created_at);
    this.updatedAt = new Date(data?.updated_at);
  }
}
