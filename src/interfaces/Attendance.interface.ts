export interface AttendanceInterface extends Document {
  studentId: string;           
  classId: string;              
  date: Date;                   
  entryTime?: Date;            
  exitTime?: Date;             
  attendedClasses?: number;   
  totalClasses: number; // Certifique-se de incluir totalClasses aqui  
  attempts: number;             
  recognitionCode?: string;     
  notes?: string;              
}
