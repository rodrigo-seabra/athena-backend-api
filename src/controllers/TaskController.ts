import { Request, Response } from "express";
import Task from "../models/Task";
import TokenHelper from "../helpers/TokenHelper";
import User, { UsersModel } from "../models/User";
import Class, { ClassModel } from "../models/Class";
import { UsersInterface } from "../interfaces/User.interface";

class TaskController {
  constructor() {
    this.updateOverdueTasksStatus();
    this.updateStudentStatus()
    this.updateAllStudentStatuses()
  }
  private async updateAllStudentStatuses() {
    try {
      const classes: ClassModel[] = await Class.find().populate('students');
  
      for (const classInstance of classes) {
        const studentIds = classInstance.students;
  
        // Buscar usuários (estudantes) correspondentes
        const students = await User.find({
          _id: { $in: studentIds },
          role: 'estudante', // Filtra apenas usuários com a role de 'estudante'
        });
  
        for (const student of students) {
          if (!student) continue; // Ignora estudantes indefinidos
  
          // Buscar todas as tarefas para o aluno na classe atual
          const tasks = await Task.find({
            recipients: classInstance._id,
          }).populate('studentResponses');
  
          for (const task of tasks) {
            if (!task) continue; // Ignora tarefas indefinidas
  
            // Verificar se a resposta do aluno existe
            const response = task.studentResponses?.find(r => r.studentId.toString() === String(student._id));
            let status: "em andamento" | "pronto" | "atrasada" | "pendente" = "pendente"; // Estado padrão
  
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            const submissionDate = response?.submissionDate ? new Date(response.submissionDate) : null;
  
            if (response) {
              if (response.graded) {
                status = 'pronto';
              } else if (dueDate && submissionDate && dueDate < submissionDate) {
                status = 'atrasada';
              } else {
                status = 'em andamento';
              }
            } else {
              // Se não houver resposta, define como "em andamento"
              status = 'em andamento';
            }
  
            const studentStatus = {
              studentId: String(student._id),
              studentName: student.name || 'Nome não disponível',
              status: status,
            };
  
            // Recarregar a tarefa para garantir que temos a versão mais recente
            const updatedTask = await Task.findById(task._id);
  
            if (updatedTask && updatedTask.studentStatus) {
              const existingStatusIndex = updatedTask.studentStatus.findIndex(ss => ss.studentId === studentStatus.studentId);
  
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
  
  
  

  
  
  
  

  private async updateOverdueTasksStatus(): Promise<void> {
    const currentDate = new Date();
    try {
      const overdueTasks = await Task.find({
        dueDate: { $lt: currentDate },
        status: { $ne: "pronto" },
      });

      if (overdueTasks.length === 0) {
        console.log("Nenhuma tarefa atrasada encontrada.");
        return;
      }

      // Iterar sobre cada tarefa vencida
      for (const task of overdueTasks) {
        // Buscar a classe associada à tarefa
        const userClass = await Class.findById(task.recipients);

        if (!userClass) {
          console.log(`Classe não encontrada para a tarefa ${task._id}`);
          continue;
        }

        const allStudents = userClass.students;
        if (task.studentResponses) {
          const studentsWhoAnswered = task.studentResponses.map(
            (response) => response.studentId
          ); // Supondo que task.responses contém as respostas
          const allStudentsAnswered = allStudents.every((studentId) =>
            studentsWhoAnswered.includes(String(studentId))
          );
          if (allStudentsAnswered) {
            task.status = "pronto";
          } else {
            task.status = "atrasada";
          }
        }
        await task.save();
      }

      console.log(`Tarefas vencidas atualizadas com sucesso.`);
    } catch (error) {
      console.error("Erro ao atualizar status das tarefas atrasadas:", error);
    }
  }

  private async updateStudentStatus(): Promise<void> {
    try {
      const tasks = await Task.find();

      for (const task of tasks) {
        if (task.studentResponses) {
          task.studentStatus?.forEach(studentStatus => {
            const response = task.studentResponses?.find(
              response => response.studentId === studentStatus.studentId
            );

            if (response) {
              studentStatus.status = "pronto";
            } else {
              if (new Date(task.dueDate) < new Date()) {
                studentStatus.status = "atrasada";
              } else {
                studentStatus.status = "em andamento";
              }
            }
          });

          await task.save();
        }
      }

      console.log("Status dos alunos atualizados com sucesso.");
    } catch (error) {
      console.error("Erro ao atualizar status dos alunos:", error);
    }
  }

  public async getAllByUserByClass(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { userId } = req.params;

      if (userId) {
        const userClass = await Class.findOne({ students: userId });
        if (!userClass) {
          return res
            .status(404)
            .json({ message: "Usuário não está em nenhuma classe." });
        }

        const allTasks = await Task.find({
          recipients: userClass._id,
        });

        const tasksWithTeacherNames = await Promise.all(
          allTasks.map(async (task) => {
            const teacher = await User.findById(task.IdTeacher);
            return {
              ...task.toObject(),
              teacherName: teacher ? teacher.name : "Professor não encontrado",
            };
          })
        );

        return res.status(200).json({
          count: tasksWithTeacherNames.length,
          tasks: tasksWithTeacherNames,
        });
      }

      return res.status(400).json({
        message: "Invalid IDs",
      });
    } catch (error: any) {
      console.error("Erro ao buscar todas as tarefas:", error);
      return res
        .status(500)
        .json({ message: "Erro ao buscar todas as tarefas." });
    }
  }

  public async getAllCompleteByUserByClass(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { userId } = req.params;

      if (userId) {
        const userClass = await Class.findOne({ students: userId });
        if (!userClass) {
          return res
            .status(404)
            .json({ message: "Usuário não está em nenhuma classe." });
        }

        const allTasks = await Task.find({
          recipients: userClass._id,
          status: "pronto",
        });

        if (allTasks.length === 0) {
          return res.status(200).json({
            count: 0,
            tasks: [],
          });
        }
        const tasksWithTeacherNames = await Promise.all(
          allTasks.map(async (task) => {
            const teacher = await User.findById(task.IdTeacher);
            return {
              ...task.toObject(),
              teacherName: teacher ? teacher.name : "Professor não encontrado",
            };
          })
        );

        return res.status(200).json({
          count: tasksWithTeacherNames.length,
          tasks: tasksWithTeacherNames,
        });
      }

      return res.status(400).json({
        message: "Invalid IDs",
      });
    } catch (error: any) {
      console.error("Erro ao buscar todas as tarefas:", error);
      return res
        .status(500)
        .json({ message: "Erro ao buscar todas as tarefas." });
    }
  }

  public async getTasksDueSoonByClass(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { userId } = req.params;
      const currentDate = new Date();
      console.log("Recebido userId:", userId);

      const upcomingDueDate = new Date(currentDate);
      upcomingDueDate.setHours(currentDate.getHours() + 48);

      if (userId) {
        const userClass = await Class.findOne({ students: userId });
        if (!userClass) {
          return res
            .status(404)
            .json({ message: "Usuário não está em nenhuma classe." });
        }

        const dueSoonTasks = await Task.find({
          dueDate: { $gte: currentDate, $lt: upcomingDueDate },
          recipients: userClass._id,
        });

        const tasksWithTeacherNames = await Promise.all(
          dueSoonTasks.map(async (task) => {
            const teacher = await User.findById(task.IdTeacher);
            return {
              ...task.toObject(),
              teacherName: teacher ? teacher.name : "Professor não encontrado",
            };
          })
        );

        return res.status(200).json({
          count: tasksWithTeacherNames.length,
          tasks: tasksWithTeacherNames,
        });
      } else {
        return res.status(400).json({
          message: "Invalid IDs",
        });
      }
    } catch (error: any) {
      console.error("Erro ao buscar tarefas em risco de atraso:", error);
      return res
        .status(500)
        .json({ message: "Erro ao buscar tarefas em risco de atraso." });
    }
  }

  public async getOverdueTasksByClass(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { userId } = req.params;
      const currentDate = new Date();

      console.log("Recebido userId:", userId);
      console.log("Data atual:", currentDate);

      if (userId) {
        const userClass = await Class.findOne({ students: userId });
        console.log("Classe do usuário encontrada:", userClass);

        if (!userClass) {
          console.log("Usuário não está em nenhuma classe.");
          return res
            .status(404)
            .json({ message: "Usuário não está em nenhuma classe." });
        }

        const overdueTasks = await Task.find({
          dueDate: { $lt: currentDate },
          recipients: userClass._id,
          status: { $ne: "pronto" },
        });

        console.log("Tarefas atrasadas encontradas:", overdueTasks);
        const tasksToDisplay = overdueTasks.filter((task) => {
          const hasResponded = task.studentResponses?.some(
            (response) => response.studentId === userId
          );
          return !hasResponded;
        });

        const tasksWithTeacherNames = await Promise.all(
          tasksToDisplay.map(async (task) => {
            const teacher = await User.findById(task.IdTeacher);
            return {
              ...task.toObject(),
              teacherName: teacher ? teacher.name : "Professor não encontrado",
            };
          })
        );

        return res.status(200).json({
          count: tasksWithTeacherNames.length,
          tasks: tasksWithTeacherNames,
        });
      } else {
        console.log("ID do usuário inválido recebido."); // Log caso o userId não seja fornecido
        return res.status(400).json({
          message: "Invalid IDs",
        });
      }
    } catch (error: any) {
      console.error("Erro ao buscar tarefas atrasadas:", error);
      return res
        .status(500)
        .json({ message: "Erro ao buscar tarefas atrasadas." });
    }
  }

  public async getCompletedTasks(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { teacherId } = req.body;
      if (teacherId) {
        const completedTasks = await Task.find({
          "studentResponses.graded": true,
          IdTeacher: teacherId,
        });
        return res.status(200).json({
          count: completedTasks.length,
          tasks: completedTasks,
        });
      } else {
        return res.status(404).send({
          message: "Tasks not found",
        });
      }
    } catch (error: any) {
      console.error("Erro ao buscar tarefas concluídas:", error);
      return res
        .status(500)
        .json({ message: "Erro ao buscar tarefas concluídas." });
    }
  }

  public async getOverdueTasks(req: Request, res: Response): Promise<Response> {
    try {
      const { teacherId } = req.params;
      const currentDate = new Date();

      if (teacherId) {
        const overdueTasks = await Task.find({
          dueDate: { $lt: currentDate },
          IdTeacher: teacherId,
        });

        return res.status(200).json({
          count: overdueTasks.length,
          tasks: overdueTasks,
        });
      } else {
        return res.status(400).json({
          message: "Invalid IDS",
        });
      }
    } catch (error: any) {
      console.error("Erro ao buscar tarefas atrasadas:", error);
      return res
        .status(500)
        .json({ message: "Erro ao buscar tarefas atrasadas." });
    }
  }

  public async getTasksDueSoon(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, teacherId } = req.params; // Obtém userId e teacherId da requisição
      const currentDate = new Date();
      const upcomingDueDate = new Date(currentDate);
      upcomingDueDate.setHours(currentDate.getHours() + 48);

      if (userId != "null") {
        const dueSoonTasks = await Task.find({
          dueDate: { $gte: currentDate, $lt: upcomingDueDate },
          recipients: userId,
        });
        return res.status(200).json({
          count: dueSoonTasks.length,
          tasks: dueSoonTasks,
        });
      } else if (teacherId) {
        const dueSoonTasks = await Task.find({
          dueDate: { $gte: currentDate, $lt: upcomingDueDate },
          IdTeacher: teacherId,
        });
        return res.status(200).json({
          count: dueSoonTasks.length,
          tasks: dueSoonTasks,
        });
      } else {
        return res.status(400).json({
          message: "Invalid IDS",
        });
      }
    } catch (error: any) {
      console.error("Erro ao buscar tarefas em risco de atraso:", error);
      return res
        .status(500)
        .json({ message: "Erro ao buscar tarefas em risco de atraso." });
    }
  }

  public async getAllTasks(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, teacherId } = req.params;
      console.log("Recebido userId e teacherId:", userId, teacherId);

      if (userId !== "null") {
        console.log("Buscando tarefas para o usuário:", userId);
        const allTasks = await Task.find({
          recipients: userId,
        });
        console.log("Tarefas encontradas para o usuário:", allTasks);
        return res.status(200).json({
          count: allTasks.length,
          tasks: allTasks,
        });
      } else if (teacherId) {
        console.log("Buscando tarefas para o professor:", teacherId);
        const allTasks = await Task.find({
          IdTeacher: teacherId,
        });
        console.log("Tarefas encontradas para o professor:", allTasks);
        return res.status(200).json({
          count: allTasks.length,
          tasks: allTasks,
        });
      }

      console.log("IDs inválidos recebidos.");
      return res.status(400).json({
        message: "Invalid IDS",
      });
    } catch (error: any) {
      console.error("Erro ao buscar todas as tarefas:", error);
      return res
        .status(500)
        .json({ message: "Erro ao buscar todas as tarefas." });
    }
  }

  public async getTaskResponsesById(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { taskId } = req.params;

      console.log("Recebido taskId:", taskId); // Log do taskId recebido

      if (!taskId) {
        console.log("ID da tarefa não fornecido."); // Log caso o taskId não seja fornecido
        return res.status(400).json({ message: "ID da tarefa não fornecido." });
      }

      const task = await Task.findById(taskId);

      console.log("Tarefa encontrada:", task); // Log da tarefa encontrada

      if (!task) {
        console.log("Tarefa não encontrada para o ID:", taskId); // Log caso a tarefa não seja encontrada
        return res.status(404).json({ message: "Tarefa não encontrada." });
      }

      const responses = task.studentResponses;
      console.log("Respostas dos estudantes:", responses); // Log das respostas dos estudantes

      if (!responses || responses.length === 0) {
        console.log("Nenhuma resposta encontrada para a tarefa ID:", taskId); // Log caso não haja respostas
        return res
          .status(404)
          .json({ message: "Nenhuma resposta encontrada para esta tarefa." });
      }

      console.log("Retornando respostas com sucesso para a tarefa ID:", taskId); // Log de sucesso
      return res.status(200).json({
        taskId: task._id,
        responses: responses,
      });
    } catch (error: any) {
      console.error("Erro ao buscar respostas da tarefa:", error); // Log do erro capturado no catch
      return res
        .status(500)
        .json({ message: "Erro ao buscar respostas da tarefa." });
    }
  }

  public async getTaskById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "ID da tarefa não fornecido." });
      }
      const task = await Task.findById(id);
      console.log("Tarefa encontrada:", task);
      if (!task) {
        return res.status(404).json({ message: "Tarefa não encontrada." });
      }
      return res.status(200).json(task);
    } catch (error: any) {
      return res.status(500).json({ message: "Erro ao buscar a tarefa." });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      console.log("Iniciando a criação da tarefa...");

      const {
        subject,
        content,
        dueDate,
        classes,
        recipients,
        attachment,
        IdTeacher,
        alternatives,
      } = req.body;

      console.log("Dados da tarefa recebidos:", req.body);

      if (!subject || !content || !dueDate || !recipients || !IdTeacher) {
        console.log("Erro: Campos obrigatórios não preenchidos.");
        return res.status(400).json({
          message: "Todos os campos obrigatórios devem ser preenchidos.",
        });
      }

      const existingTask = await Task.findOne({ subject, dueDate });
      console.log("Verificando se a tarefa já existe:", existingTask);

      if (existingTask) {
        console.log(
          "Erro: Já existe uma tarefa com o mesmo assunto e data de vencimento."
        );
        return res.status(400).json({
          message:
            "Já existe uma tarefa com o mesmo assunto e data de vencimento.",
        });
      }

      const newTask = new Task({
        subject,
        content,
        dueDate,
        recipients,
        attachment,
        IdTeacher,
        alternatives,
        studentResponses: [], // Inicializa como um array vazio
        studentStatus: [], // Adiciona status dos alunos
      });

      console.log("Nova tarefa a ser criada:", newTask);

      // Busca as classes associadas à tarefa
      const userClass = await Class.findById(newTask.IdClass);
      if (!userClass) {
        console.log(`Classe não encontrada para a tarefa ${newTask._id}`);
        return res.status(400).json({
          message: "Classe não encontrada.",
        });
      }

      // Pega todos os alunos da classe
      const allStudents = userClass.students; // Lista de IDs dos alunos

      // Busca os nomes dos alunos
      const studentsDetails = await User.find({ _id: { $in: allStudents } });

      newTask.studentStatus = allStudents.map((studentId) => {
        const student = studentsDetails.find(
          (s) => String(s._id) === String(studentId)
        );
        return {
          studentId: String(studentId),
          studentName: student ? student.name : "Nome não encontrado",
          status: "em andamento",
        };
      });

      const createdTask = await Task.create(newTask);
      console.log("Tarefa criada com sucesso:", createdTask);

      return res.status(201).json({
        message: "Tarefa criada com sucesso.",
        task: createdTask,
      });
    } catch (error) {
      console.error("Erro ao criar a tarefa:", error);
      return res.status(500).json({ message: "Erro ao criar a tarefa." });
    }
  }

  public async addStudentResponse(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      console.log("Adicionando resposta do estudante...");

      const { idTask, responseContent, selectedAlternative, attachment } =
        req.body;
      let user: UsersModel | null = TokenHelper.User;

      console.log("Dados recebidos para adicionar resposta:", req.body);
      console.log("Usuário atual:", user);

      if (!idTask || !user?._id || (!responseContent && !selectedAlternative)) {
        console.log("Erro: Campos obrigatórios faltando.");
        return res.status(400).json({
          message:
            "Campos obrigatórios faltando: idTask, studentId, ou resposta/alternativa.",
        });
      }

      const existingTask = await Task.findOne({ _id: idTask });
      console.log("Verificando se a tarefa existe:", existingTask);

      if (!existingTask) {
        console.log("Erro: Tarefa não encontrada.");
        return res.status(404).json({ message: "Tarefa não encontrada." });
      }

      const existingResponse = existingTask.studentResponses?.find(
        (data) => data.studentId === user._id?.toString()
      );

      if (existingResponse) {
        console.log("Erro: O estudante já respondeu a esta tarefa.");
        return res
          .status(409)
          .json({ message: "Estudante já respondeu a esta tarefa." });
      }

      let isCorrect = false;

      if (selectedAlternative && existingTask.alternatives) {
        const alternative = existingTask.alternatives.find(
          (alt) => alt.text === selectedAlternative
        );
        if (alternative) {
          isCorrect = alternative.isCorrect;
          console.log("Alternativa selecionada encontrada:", alternative);
        }
      }

      existingTask.studentResponses?.push({
        studentId: user._id.toString(),
        studentName: user.name,
        responseContent: responseContent || selectedAlternative,
        selectedAlternative: selectedAlternative,
        attachment: attachment,
        graded: false,
        submissionDate: new Date(),
      });

      const studentStatus = existingTask.studentStatus?.find(
        (status) => status.studentId === String(user._id)
      );

      if (studentStatus) {
        studentStatus.status = "pronto"; // Atualiza o status para "pronto"
      }

      console.log(
        "Respostas do estudante atualizadas:",
        existingTask.studentResponses
      );

      await existingTask.save();
      console.log("Tarefa salva com a nova resposta.");

      return res.status(200).json({
        message: "Resposta enviada com sucesso.",
        isCorrect,
      });
    } catch (error: any) {
      console.error("Erro ao adicionar resposta do estudante:", error);
      return res.status(400).json({ message: error.message });
    }
  }

  public async addTeacherResponse(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      console.log("Adicionando resposta do professor...");

      const { idStudent, idTask } = req.body;

      const existingTask = await Task.findOne({ _id: idTask });
      console.log(
        "Verificando a tarefa para resposta do professor:",
        existingTask
      );

      if (!existingTask) {
        console.log("Erro: Tarefa não encontrada.");
        throw new Error("Task not found");
      }

      const existingResponse = existingTask.studentResponses?.find(
        (response) => response.studentId === idStudent
      );

      if (!existingResponse) {
        console.log("Erro: Resposta do estudante não existe.");
        throw new Error("Response not exist");
      }

      const { feedback, grade } = req.body;
      console.log("Feedback e nota recebidos:", feedback, grade);

      if (!feedback || grade === undefined) {
        console.log("Erro: Dados faltando.");
        throw new Error("Dados faltando");
      }

      existingResponse.feedback = feedback;
      existingResponse.grade = grade;
      existingResponse.graded = true;

      await existingTask.save();
      console.log(
        "Resposta do estudante atualizada com sucesso:",
        existingResponse
      );

      return res
        .status(200)
        .json({ message: "Response updated successfully", existingResponse });
    } catch (error: any) {
      console.error("Erro ao adicionar resposta do professor:", error);
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new TaskController();

function getErrorMessage(err: unknown) {
  throw new Error("Function not implemented");
}
