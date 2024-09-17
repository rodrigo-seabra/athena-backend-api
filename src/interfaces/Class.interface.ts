import { UsersInterface } from "./User.interface";

export interface ClassInterface {
    name: string;
    grade: string;  
    teacher: UsersInterface[]; 
    students: UsersInterface[]; 
    IdSchool: String; 
    year: number; 
    subject: string[]; 
  }
  