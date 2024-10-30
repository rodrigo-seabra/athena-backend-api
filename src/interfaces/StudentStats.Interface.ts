import { Types } from "mongoose";

export interface SubjectProficiency {
    name: string;
    averageLevel: number;
    activitiesCount: number;
  }

  export interface PastStat {
    semester: string; 
    subjects: SubjectProficiency[];
  }
  
  export interface StudentStatsInterface {
    userId: Types.ObjectId | string; 
    subjects: SubjectProficiency[];
    pastStat: PastStat[];
    createdAt?: Date; 
    updatedAt?: Date;
  }
  