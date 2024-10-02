export interface TaskInterface {
    subject: string;                
    content: string;                
    dueDate: Date;                  
    recipients: string[];           
    attachment?: string[];         
    IdTeacher: string;   
    class?: string;      
    status?: "em andamento" | "pronto";   
    school?: string,    
    alternatives?: {
      text: string;            
      isCorrect: boolean;      
    }[];                     
    studentResponses?: {
      studentId: string;            
      responseContent: string;    
      selectedAlternative?: string;  
      attachment?: string[];        
      submissionDate?: Date;        
      graded?: boolean;             
      grade?: number;               
      feedback?: string;            
    }[];
  }