import { UsersInterface } from "./User.interface";

export interface ClassInterface {
  name: string;
  grade: string;
  teacher: UsersInterface[];
  students: UsersInterface[];
  IdSchool: string;
  year: number;
  subject: string[];
  pendingRequests:{
    id: string,
    name: string,
    cpf: string
  }[];
}