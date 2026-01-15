export class User {
  id?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  token?: string;
}

export class Employee {
  id?: string;
  iin?: string;
  firstname?: string;
  lastname?: string;
  middlename?: string;
  image?: string;
  organization?: Organization;
  dictionary?: any;
  constructor(data: any) {
    this.id = data.id;
    this.iin = data.iin;
    this.firstname = data.firstname;
    this.lastname = data.lastname;
    this.middlename = data.middlename;
    this.image = data.image;
    if (data.organization) {
      this.organization = new Organization(data.organization);
    }
    this.dictionary = data.dictionary;
  }
  public getPosition(): string {
    return this.dictionary?.position || "";
  }
}

export class Organization {
  id?: string;
  name?: string;
  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
  }
}

export interface EmployeeDto {
  id: string;
  iin: string;
  personnelNumber: string;
  firstname: string;
  lastname: string;
  middlename: string;
  birthdate: string;
  gender: string;
  type: string;
  socialStatus: string;
  isActive: boolean;
  isHazardousOccupation: boolean;
  telephoneNumber: string;
  positionId: string;
  organizationId: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  properties?: {
    [key: string]: string;
  };
}

export enum EmployeeGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum EmployeeType {
  SUPERVISOR = 'SUPERVISOR',
  SAFETY_ENGINEER = 'SAFETY_ENGINEER',
  MED_WORKER = 'MED_WORKER',
  MC_WORKER = 'MC_WORKER',
  DOC_WORKER = 'DOC_WORKER',
  SV_WORKER = 'SV_WORKER',
  ADMIN_WORKER = 'ADMIN_WORKER',
  REG_WORKER = 'REG_WORKER',
}

export enum EmployeeSocialStatus {
  WORKER = 'WORKER',
  PENSIONER = 'PENSIONER',
  FAMILY_MEMBER = 'FAMILY_MEMBER',
  REGRESSOR = 'REGRESSOR',
  OTHER = 'OTHER',
}
