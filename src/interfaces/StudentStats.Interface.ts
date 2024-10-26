import { Types } from "mongoose";

export interface SubjectProficiency {
    name: string;
    averageLevel: number;
    activitiesCount: number;
  }
  
  export interface StudentStatsInterface {
    userId: Types.ObjectId | string; 
    subjects: SubjectProficiency[];
  }
  