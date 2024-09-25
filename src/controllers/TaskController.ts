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
        classes,
        status,
        recipients,
        attachment,
        professorId,
        studentResponses,
        alternatives, // Adicionando as alternativas
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
        status,
        class: classes,
        alternatives,
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
      const { idTask, responseContent, selectedAlternative, attachment } =
        req.body;
      let user: UsersModel | null = TokenHelper.User;

      if (!idTask || !user?._id || (!responseContent && !selectedAlternative)) {
        return res.status(400).json({
          message:
            "Campos obrigatórios faltando: idTask, studentId, ou resposta/alternativa.",
        });
      }

      const existingTask = await Task.findOne({ _id: idTask });
      if (!existingTask) {
        return res.status(404).json({ message: "Tarefa não encontrada." });
      }

      const existingResponse = existingTask.studentResponses?.find(
        (data) => data.studentId === user._id?.toString()
      );

      if (existingResponse) {
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

      await existingTask.save();

      return res.status(200).json({
        message: "Resposta enviada com sucesso.",
        isCorrect,
      });
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

      const existingTask = await Task.findOne({ _id: idTask });

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

  public async getTeacherStats(req: Request, res: Response): Promise<Response> {
    try {
      const { professorId } = req.params;
      if (!professorId) {
        throw new Error("Professor ID está faltando");
      }

      const tasks = await Task.find({ professorId });

      if (!tasks.length) {
        return res.status(200).json({
          totalTasks: 0,
          averageGrade: null,
          overdueTasks: 0,
          completedPercentage: 0,
          inProgressPercentage: 0,
          overduePercentage: 0,
          dueSoonTasks: [],
          overallClassGrade: null,
        });
      }

      const totalTasks = tasks.length;

      let totalGrade = 0;
      let totalGradesCount = 0;
      let overallClassGradeSum = 0;
      let completedTasks = 0;
      let inProgressTasks = 0;
      let overdueTasks = 0;

      const now = new Date();
      const dueSoonTasks = tasks.filter((task) => {
        const dueDate = new Date(task.dueDate);
        return (
          dueDate > now &&
          dueDate <= new Date(now.getTime() + 48 * 60 * 60 * 1000)
        );
      });

      tasks.forEach((task) => {
        if (task.status === "pronto") completedTasks++;
        if (task.status === "em andamento") inProgressTasks++;
        if (task.dueDate < now) overdueTasks++;

        const grades =
          task.studentResponses
            ?.map((response) => response.grade)
            .filter((grade) => grade !== undefined) || [];
        overallClassGradeSum += grades.reduce(
          (acc, grade) => acc + (grade || 0),
          0
        );
        totalGradesCount += grades.length;

        totalGrade += grades.reduce((acc, grade) => acc + (grade || 0), 0);
        totalGradesCount += grades.length;
      });

      const averageGrade =
        totalGradesCount > 0 ? totalGrade / totalGradesCount : null;

      const completedPercentage = (
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      ).toFixed(2);
      const inProgressPercentage = (
        totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0
      ).toFixed(2);
      const overduePercentage = (
        totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0
      ).toFixed(2);

      const overallClassGrade =
        totalGradesCount > 0 ? overallClassGradeSum / totalGradesCount : null;

      return res.status(200).json({
        totalTasks,
        averageGrade,
        overdueTasks,
        completedPercentage,
        inProgressPercentage,
        overduePercentage,
        dueSoonTasks,
        overallClassGrade,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new TaskController();

function getErrorMessage(err: unknown) {
  throw new Error("Function not implemented");
}
