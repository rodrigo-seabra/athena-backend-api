export interface TaskInterface {
    subject: string;                
    content: string;                
    dueDate: Date;                  
    recipients: string[];           
    attachment?: string[];         
    IdTeacher: string;   
    IdClass?: string;      
    status?: "em andamento" | "pronto" | "atrasada" | "cancelada" | "pendente";   
    school?: string,    
    alternatives?: {
      text: string;            
      isCorrect: boolean;      
    }[];      
    studentStatus?: {
      studentId: string;
      studentName: string;
      status: "em andamento" | "pronto" | "atrasada" | "pendente";  
    }[];               
    studentResponses?: {
      studentId: string;
      studentName: string,            
      responseContent: string;    
      selectedAlternative?: string;  
      attachment?: string[];        
      submissionDate?: Date;        
      graded?: boolean;             
      grade?: number;               
      feedback?: string;            
    }[];
  }