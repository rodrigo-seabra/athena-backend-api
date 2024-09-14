export interface TaskInterface {
    _id: string;                    
    subject: string;                
    content: string;                
    dueDate: Date;                  
    recipients: string[];           
    attachment?: string[];         
    professorId: string;           
    createdAt: Date;                
    updatedAt?: Date;               
    studentResponses?: {            
      studentId: string;            
      responseContent: string;      
      attachment?: string[];        
      submissionDate?: Date;        
      graded?: boolean;             
      grade?: number;               
      feedback?: string;            
    }[];
  }