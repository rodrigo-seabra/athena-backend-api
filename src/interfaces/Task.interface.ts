export interface TaskInterface {
    subject: string;                
    content: string;                
    dueDate: Date;                  
    recipients: string[];           
    attachment?: string[];         
    professorId: string;   
    class?: string;      
    status?: "em andamento" | "pronto";   
    school?: string,            
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