import { Request, Response } from "express";
import Task from "../models/Task";
import { UsersInterface } from "../interfaces/User.interface";
import TokenHelper from "../helpers/TokenHelper";
import { UsersModel } from "../models/User";
import { TaskInterface } from "../interfaces/Task.interface";

class TaskController {
  public async getCompletedTasks(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { userId, teacherId } = req.body;
      if (userId) {
        const completedTasks = await Task.find({
          "studentResponses.graded": true,
          "studentResponses.studentId": userId,
        });
        return res.status(200).json({
          count: completedTasks.length,
          tasks: completedTasks,
        });
      } else if (teacherId) {
        const completedTasks = await Task.find({
          "studentResponses.graded": true,
          IdTeacher: teacherId,
        });
        return res.status(200).json({
          count: completedTasks.length,
          tasks: completedTasks,
        });
      } else{
        return res.status(404).send({
          message: "Tasks not found"
        })
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
      const { userId, teacherId } = req.params; 
      const currentDate = new Date();
      if(userId)
      {
        const overdueTasks = await Task.find({ 
          dueDate: { $lt: currentDate },
          recipients: userId,
        });
        return res.status(200).json({
          count: overdueTasks.length,
          tasks: overdueTasks,
        });
      }else if (teacherId)
      {
        const overdueTasks = await Task.find({ 
          dueDate: { $lt: currentDate },
          IdTeacher: teacherId 
        });
  
        return res.status(200).json({
          count: overdueTasks.length,
          tasks: overdueTasks,
        });
      }else{
        return res.status(400).json({
          message: "Invalid IDS"
        });      
      }

    } catch (error: any) {
      console.error("Erro ao buscar tarefas atrasadas:", error);
      return res.status(500).json({ message: "Erro ao buscar tarefas atrasadas." });
    }
  }

  public async getTasksDueSoon(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, teacherId } = req.params; // Obtém userId e teacherId da requisição
      const currentDate = new Date();
      const upcomingDueDate = new Date(currentDate);
      upcomingDueDate.setHours(currentDate.getHours() + 48);

      if(userId)
      {
        const dueSoonTasks = await Task.find({
          dueDate: { $gte: currentDate, $lt: upcomingDueDate },
          recipients: userId,
        });
        return res.status(200).json({
          count: dueSoonTasks.length,
          tasks: dueSoonTasks,
        });
      }else if( teacherId )
      {
        const dueSoonTasks = await Task.find({
          dueDate: { $gte: currentDate, $lt: upcomingDueDate },
          IdTeacher: teacherId
        });
        return res.status(200).json({
          count: dueSoonTasks.length,
          tasks: dueSoonTasks,
        });
      }else{

        return res.status(400).json({
          message: "Invalid IDS"
        });      
      }
    } catch (error: any) {
      console.error("Erro ao buscar tarefas em risco de atraso:", error);
      return res.status(500).json({ message: "Erro ao buscar tarefas em risco de atraso." });
    }
  }

  public async getAllTasks(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, teacherId } = req.params; 

      if ( userId)
      {
        const allTasks = await Task.find({ 
          recipients: userId,
        });
        return res.status(200).json({
          count: allTasks.length,
          tasks: allTasks,
        });
      }else if ( teacherId )
      {
        const allTasks = await Task.find({ 
          IdTeacher: teacherId 
        });
        return res.status(200).json({
          count: allTasks.length,
          tasks: allTasks,
        });
      }


      return res.status(400).json({
        message: "Invalid IDS"
      });
    } catch (error: any) {
      console.error("Erro ao buscar todas as tarefas:", error);
      return res.status(500).json({ message: "Erro ao buscar todas as tarefas." });
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
        status,
        recipients,
        attachment,
        IdTeacher,
        studentResponses,
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
        studentResponses,
        status,
        class: classes,
        alternatives,
      });

      console.log("Nova tarefa a ser criada:", newTask);

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
          .json({ message: "Student already responded to this task" });
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
        responseContent: responseContent || selectedAlternative,
        selectedAlternative: selectedAlternative,
        attachment: attachment,
        graded: false,
        submissionDate: new Date(),
      });

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
