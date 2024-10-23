import { Request, Response, NextFunction } from 'express';
import Task from '../models/Task'; // Ajuste o caminho conforme necessário
import Class from '../models/Class'; 
import User from '../models/User'; 

class UpdateStatusesMiddleware {
    public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await this.updateOverdueTasksStatus();
        await this.updateStudentStatus();
        await this.updateAllStudentStatuses();
  
        console.log('Status atualizados com sucesso.');
        next(); 
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
        next(error);
      }
    }
  
    private updateOverdueTasksStatus = async (): Promise<void> => {
      const currentDate = new Date();
      try {
        const overdueTasks = await Task.find({
          dueDate: { $lt: currentDate },
          status: { $ne: 'pronto' },
        });
  
        for (const task of overdueTasks) {
          const userClass = await Class.findById(task.recipients);
          if (!userClass) continue;
  
          const allStudents = userClass.students;
          if (task.studentResponses) {
            const studentsWhoAnswered = task.studentResponses.map(
              (response) => response.studentId
            );
            const allStudentsAnswered = allStudents.every((studentId) =>
              studentsWhoAnswered.includes(String(studentId))
            );
            task.status = allStudentsAnswered ? 'pronto' : 'atrasada';
          } else {
            task.status = 'atrasada';
          }
  
          await task.save();
        }
  
        console.log('Tarefas vencidas atualizadas com sucesso.');
      } catch (error) {
        console.error('Erro ao atualizar status das tarefas atrasadas:', error);
      }
    }
  
    private updateStudentStatus = async (): Promise<void> => {
      try {
        const tasks = await Task.find();
  
        for (const task of tasks) {
          if (task.studentResponses) {
            task.studentStatus?.forEach((studentStatus) => {
              const response = task.studentResponses?.find(
                (response) => response.studentId === studentStatus.studentId
              );
  
              if (response) {
                studentStatus.status = 'pronto';
              } else {
                if (new Date(task.dueDate) < new Date()) {
                  studentStatus.status = 'atrasada';
                } else {
                  studentStatus.status = 'em andamento';
                }
              }
            });
  
            await task.save();
          }
        }
  
        console.log('Status dos alunos atualizados com sucesso.');
      } catch (error) {
        console.error('Erro ao atualizar status dos alunos:', error);
      }
    }
  
    private updateAllStudentStatuses = async (): Promise<void> => {
      try {
        const classes = await Class.find().populate('students');
  
        for (const classInstance of classes) {
          const studentIds = classInstance.students;
          const students = await User.find({
            _id: { $in: studentIds },
            role: 'estudante',
          });
  
          for (const student of students) {
            if (!student) continue;
  
            const tasks = await Task.find({
              recipients: classInstance._id,
            }).populate('studentResponses');
  
            for (const task of tasks) {
              const response = task.studentResponses?.find(
                (r) => r.studentId.toString() === String(student._id)
              );
              let status: 'em andamento' | 'pronto' | 'atrasada' = 'em andamento';
  
              const dueDate = task.dueDate ? new Date(task.dueDate) : null;
              const submissionDate = response?.submissionDate
                ? new Date(response.submissionDate)
                : null;
  
              if (response) {
                if (response.graded) {
                  status = 'pronto';
                } else if (dueDate && submissionDate && dueDate < submissionDate) {
                  status = 'atrasada';
                } else {
                  status = 'em andamento';
                }
              } else if (dueDate && dueDate < new Date()) {
                status = 'atrasada';
              }
  
              const studentStatus = {
                studentId: String(student._id),
                studentName: student.name || 'Nome não disponível',
                status: status,
              };
  
              const updatedTask = await Task.findById(task._id);
              if (updatedTask && updatedTask.studentStatus) {
                const existingStatusIndex = updatedTask.studentStatus.findIndex(
                  (ss) => ss.studentId === studentStatus.studentId
                );
  
                if (existingStatusIndex !== -1) {
                  updatedTask.studentStatus[existingStatusIndex] = studentStatus;
                } else {
                  updatedTask.studentStatus.push(studentStatus);
                }
  
                await updatedTask.save();
              }
            }
          }
        }
  
        console.log('Todos os studentStatus foram atualizados com sucesso.');
      } catch (error) {
        console.error('Erro ao atualizar studentStatus:', error);
      }
    }
  }
  
  export default new UpdateStatusesMiddleware();
  

