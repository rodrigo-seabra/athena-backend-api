import { Request, Response } from "express";
import Task from "../models/Task";
import { UsersInterface } from "../interfaces/User.interface";
import TokenHelper from "../helpers/TokenHelper";
import { UsersModel } from "../models/User";
import { TaskInterface } from "../interfaces/Task.interface";
class TaskController {
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const {
        subject,
        content,
        dueDate,
        recipients,
        attachment,
        professorId,
        studentResponses,
      } = req.body;
      if (!subject || !content || !dueDate || !recipients || !professorId) {
        return res.status(400).json({
          message: "Todos os campos obrigatórios devem ser preenchidos.",
        });
      }
      const existingTask = await Task.findOne({ subject, dueDate });
      if (existingTask) {
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
        professorId,
        studentResponses,
      });
      const createdTask = await Task.create(newTask);
      return res.status(201).json({
        message: "Tarefa criada com sucesso.",
        task: createdTask,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao criar a tarefa." });
    }
  }
  public async addStudentResponse(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { idTask, responseContent, attachment, date } = req.body;

      let user: UsersModel | null = TokenHelper.User;
      console.log(user);
      if (!idTask || !user?._id || !responseContent) {
        return res.status(400).json({
          message:
            "Missing required fields: idTask, studentId, or responseContent",
        });
      }

      const existingTask = await Task.findOne({ _id: idTask });
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      const existingResponse: any = existingTask.studentResponses?.filter(
        (data) => data.studentId == user._id
      );

      if (existingResponse && existingResponse.length > 0) {
        return res
          .status(409)
          .json({ message: "Student already responded to this task" });
      }

      if (existingResponse) {
        return res
          .status(409)
          .json({ message: "Student already responded to this task" });
      }
      existingTask.studentResponses?.push({
        studentId: user._id.toString(),
        responseContent: responseContent,
        attachment: attachment,
        graded: false,
        submissionDate: new Date(),
      });
      existingTask.save();
      const response: any = existingTask.studentResponses?.filter(
        (data) => data.studentId == user._id
      );
      if (!response && response.length == 0) {
        throw new Error("Respose not found.");
      }

      return res.status(200).json({ message: response[0]._id });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
  public async addTeacherResponse(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { idStudent, idTask } = req.body; 
      
      const existingTask = await Task.findOne({ _id : idTask });

      if (!existingTask) {
        throw new Error("Task not found");
      }

      const existingResponse = existingTask.studentResponses?.find(
        (response) => response.studentId === idStudent
      );

      if (!existingResponse) {
        throw new Error("Response not exist");
      }

      const { feedback, grade } = req.body;

      if (!feedback || grade === undefined) {
        throw new Error("Dados faltando");
      }

      existingResponse.feedback = feedback;
      existingResponse.grade = grade;
      existingResponse.graded = true; 
      await existingTask.save();

      return res
        .status(200)
        .json({ message: "Response updated successfully", existingResponse });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new TaskController();

function getErrorMessage(err: unknown) {
  throw new Error("Function not implemented");
}
