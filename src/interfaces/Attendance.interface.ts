export interface AttendanceInterface extends Document {
  studentId: string;           
  classId: string;              
  date: Date;                   
  entryTime?: Date;            
  exitTime?: Date;             
  attendedClasses?: number;   
  totalClasses: number; 
  attempts: number;             
  recognitionCode?: string;     
  notes?: string;              
}
