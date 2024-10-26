import { Request, Response } from "express";
import Task from "../models/Task";
import TokenHelper from "../helpers/TokenHelper";
import User, { UsersModel } from "../models/User";
import Class, { ClassModel } from "../models/Class";
import { UsersInterface } from "../interfaces/User.interface";

class TaskController {

  public async getPendingTasksByUser(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: "ID do usuário não fornecido." });
      }

      const pendingTasks = await Task.find({
        "studentStatus": {
          $elemMatch: {
            studentId: userId,
            status: "em andamento"
          }
        }
      }).lean();

      const tasksWithTeacherNames = await Promise.all(
        pendingTasks.map(async (task) => {
          const teacher = await User.findById(task.IdTeacher);

          const filteredStudentStatus = task.studentStatus?.filter(
            (status) => status.studentId === userId
          );

          return {
            ...task,
            teacherName: teacher ? teacher.name : "Professor não encontrado",
            studentStatus: filteredStudentStatus,
          };
        })
      );

      return res.status(200).json({
        count: tasksWithTeacherNames.length,
        tasks: tasksWithTeacherNames,
      });
    } catch (error: any) {
      console.error("Erro ao buscar tarefas pendentes:", error);
      return res.status(500).json({ message: "Erro ao buscar tarefas pendentes." });
    }
  }


  public async getAllByUser(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, status } = req.params;
      const currentDate = new Date();

      if (!userId) {
        return res
          .status(400)
          .json({ message: "ID do usuário não fornecido." });
      }

      const query: any = { "studentStatus.studentId": userId };
      if (status === "pendente") {
        query["studentStatus.status"] = "em andamento";
      } else if (status === "atrasada") {
        query.dueDate = { $lt: currentDate };
        query["studentStatus.status"] = { $ne: "pronto" };
      } else if (status === "pronto") {
        query["studentStatus.status"] = "pronto";
      }

      const tasks = await Task.find(query).lean();
      const tasksWithTeacherNames = await Promise.all(
        tasks.map(async (task) => {
          const teacher = await User.findById(task.IdTeacher);

          const filteredStudentStatus = task.studentStatus?.filter(
            (status) => status.studentId === userId
          );

          return {
            ...task,
            teacherName: teacher ? teacher.name : "Professor não encontrado",
            studentStatus: filteredStudentStatus,
          };
        })
      );

      return res.status(200).json({
        count: tasksWithTeacherNames.length,
        tasks: tasksWithTeacherNames,
      });
    } catch (error: any) {
      console.error("Erro ao buscar tarefas:", error);
      return res.status(500).json({ message: "Erro ao buscar tarefas." });
    }
  }

  public async getAllCompleteByUser(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: "ID do usuário não fornecido." });
      }

      // Busca apenas tarefas onde o status do aluno é "pronto"
      const completedTasks = await Task.find({
        "studentStatus": {
          $elemMatch: {
            studentId: userId,
            status: "pronto" // Verifica se o status é "pronto"
          }
        }
      }).lean();

      const tasksWithFilteredData = await Promise.all(
        completedTasks.map(async (task) => {
          const teacher = await User.findById(task.IdTeacher);

          // Filtra apenas o status e as respostas do aluno
          const filteredStudentStatus = task.studentStatus?.filter(
            (status) => status.studentId === userId
          );

          const filteredResponses = task.studentResponses?.filter(
            (response) => response.studentId.toString() === userId
          );

          return {
            ...task,
            teacherName: teacher ? teacher.name : "Professor não encontrado",
            studentStatus: filteredStudentStatus,
            studentResponses: filteredResponses,
          };
        })
      );

      return res.status(200).json({
        count: tasksWithFilteredData.length,
        tasks: tasksWithFilteredData,
      });
    } catch (error: any) {
      console.error("Erro ao buscar tarefas completas:", error);
      return res.status(500).json({ message: "Erro ao buscar tarefas completas." });
    }
  }



  public async getTasksDueSoonByUser(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { userId } = req.params;
      const currentDate = new Date();

      const upcomingDueDate = new Date(currentDate);
      upcomingDueDate.setHours(currentDate.getHours() + 48);

      if (!userId) {
        return res.status(400).json({ message: "ID do usuário não fornecido." });
      }

      const dueSoonTasks = await Task.find({
        dueDate: { $gte: currentDate, $lt: upcomingDueDate },
        "studentStatus": {
          $elemMatch: {
            studentId: userId,
            status: "em andamento", // Verifica se o status é "em andamento"
          }
        }
      }).lean();

      const tasksWithTeacherNames = await Promise.all(
        dueSoonTasks.map(async (task) => {
          const teacher = await User.findById(task.IdTeacher);

          const filteredStudentStatus = task.studentStatus?.filter(
            (status) => status.studentId === userId
          );

          return {
            ...task,
            teacherName: teacher ? teacher.name : "Professor não encontrado",
            studentStatus: filteredStudentStatus,
          };
        })
      );

      if (tasksWithTeacherNames.length === 0) {
        return res.status(404).json({
          message: "Nenhuma tarefa com vencimento próximo encontrada.",
        });
      }

      return res.status(200).json({
        count: tasksWithTeacherNames.length,
        tasks: tasksWithTeacherNames,
      });
    } catch (error: any) {
      console.error("Erro ao buscar tarefas com vencimento próximo:", error);
      return res.status(500).json({ message: "Erro ao buscar tarefas com vencimento próximo." });
    }
  }

  public async getOverdueTasksByUser(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { userId } = req.params;
      const currentDate = new Date();

      if (!userId) {
        return res.status(400).json({ message: "ID do usuário não fornecido." });
      }

      const overdueTasks = await Task.find({
        dueDate: { $lt: currentDate },
        "studentStatus": {
          $elemMatch: {
            studentId: userId,
            status: "atrasada", // Verifica se o status é "atrasada"
          }
        }
      }).lean();

      const tasksWithTeacherNames = await Promise.all(
        overdueTasks.map(async (task) => {
          const teacher = await User.findById(task.IdTeacher);

          const filteredStudentStatus = task.studentStatus?.filter(
            (status) => status.studentId === userId
          );

          return {
            ...task,
            teacherName: teacher ? teacher.name : "Professor não encontrado",
            studentStatus: filteredStudentStatus,
          };
        })
      );

      if (tasksWithTeacherNames.length === 0) {
        return res.status(404).json({ message: "Nenhuma tarefa atrasada encontrada." });
      }

      return res.status(200).json({
        count: tasksWithTeacherNames.length,
        tasks: tasksWithTeacherNames,
      });
    } catch (error: any) {
      console.error("Erro ao buscar tarefas atrasadas:", error);
      return res.status(500).json({ message: "Erro ao buscar tarefas atrasadas." });
    }
  }




  public async getUserGrades(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: "ID do usuário não fornecido." });
      }

      const tasksWithGrades = await Task.find({
        "studentResponses.studentId": userId,
        "studentResponses.graded": true,
      });

      if (tasksWithGrades.length === 0) {
        return res.status(404).json({ message: "Nenhuma nota encontrada." });
      }

      const grades = tasksWithGrades.map(task => {
        const studentResponse = task.studentResponses?.find(
          response => response.studentId.toString() === userId
        );

        return {
          taskId: task._id,
          taskTitle: task.content,
          grade: studentResponse?.grade,
          feedback: studentResponse?.feedback,
        };
      });

      return res.status(200).json({
        count: grades.length,
        grades,
      });
    } catch (error: any) {
      console.error("Erro ao buscar notas do usuário:", error);
      return res.status(500).json({ message: "Erro ao buscar notas do usuário." });
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
        recipients, 
        attachment,
        IdTeacher,
        alternatives,
      } = req.body;
  
  
      if (!subject || !content || !dueDate || !recipients || !IdTeacher) {
        console.log("Erro: Campos obrigatórios não preenchidos.");
        return res.status(400).json({
          message: "Todos os campos obrigatórios devem ser preenchidos.",
        });
      }
  
      const existingTask = await Task.findOne({ subject, dueDate });
  
      if (existingTask) {
 
        return res.status(400).json({
          message: "Já existe uma tarefa com o mesmo assunto e data de vencimento.",
        });
      }
  
      const newTask = new Task({
        subject,
        content,
        dueDate,
        status : "em andamento",
        recipients, 
        attachment,
        IdTeacher,
        alternatives,
        studentResponses: [], 
        studentStatus: [], 
      });
  
      console.log("Nova tarefa a ser criada:", newTask);
  
      const classes = await Class.find({ _id: { $in: recipients } });
      if (classes.length !== recipients.length) {
        return res.status(400).json({
          message: "Uma ou mais classes não foram encontradas.",
        });
      }
  
      const createdTask = await Task.create(newTask);
  
      return res.status(201).json({
        message: "Tarefa criada com sucesso.",
        task: createdTask,
      });
    } catch (error) {
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
        studentStatus.status = "pronto"; 
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
