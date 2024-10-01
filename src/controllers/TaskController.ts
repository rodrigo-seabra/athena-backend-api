import { Request, Response } from "express";
import Task from "../models/Task";
import { UsersInterface } from "../interfaces/User.interface";
import TokenHelper from "../helpers/TokenHelper";
import { UsersModel } from "../models/User";
import { TaskInterface } from "../interfaces/Task.interface";

class TaskController {
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
        professorId,
        studentResponses,
        alternatives,
      } = req.body;

      console.log("Dados da tarefa recebidos:", req.body);

      if (!subject || !content || !dueDate || !recipients || !professorId) {
        console.log("Erro: Campos obrigatórios não preenchidos.");
        return res.status(400).json({
          message: "Todos os campos obrigatórios devem ser preenchidos.",
        });
      }

      const existingTask = await Task.findOne({ subject, dueDate });
      console.log("Verificando se a tarefa já existe:", existingTask);
      
      if (existingTask) {
        console.log("Erro: Já existe uma tarefa com o mesmo assunto e data de vencimento.");
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

  public async addStudentResponse(req: Request, res: Response): Promise<Response> {
    try {
      console.log("Adicionando resposta do estudante...");

      const { idTask, responseContent, selectedAlternative, attachment } = req.body;
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

      console.log("Respostas do estudante atualizadas:", existingTask.studentResponses);

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

  public async addTeacherResponse(req: Request, res: Response): Promise<Response> {
    try {
      console.log("Adicionando resposta do professor...");

      const { idStudent, idTask } = req.body;

      const existingTask = await Task.findOne({ _id: idTask });
      console.log("Verificando a tarefa para resposta do professor:", existingTask);

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
      console.log("Resposta do estudante atualizada com sucesso:", existingResponse);

      return res
        .status(200)
        .json({ message: "Response updated successfully", existingResponse });
    } catch (error: any) {
      console.error("Erro ao adicionar resposta do professor:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  public async getTeacherStats(req: Request, res: Response): Promise<Response> {
    try {
      console.log("Obtendo estatísticas do professor...");

      const { professorId } = req.params;
      console.log("ID do professor recebido:", professorId);

      if (!professorId) {
        console.log("Erro: Professor ID está faltando.");
        throw new Error("Professor ID está faltando");
      }

      const tasks = await Task.find({ professorId });
      console.log("Tarefas encontradas para o professor:", tasks);

      if (!tasks.length) {
        console.log("Nenhuma tarefa encontrada para o professor.");
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
      console.log("Total de tarefas encontradas:", totalTasks);

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

      console.log("Tarefas que estão quase vencendo:", dueSoonTasks);

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

      console.log("Total de notas:", totalGrade);
      console.log("Total de notas contadas:", totalGradesCount);

      const averageGrade =
        totalGradesCount > 0 ? totalGrade / totalGradesCount : null;
      console.log("Média das notas:", averageGrade);

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

      console.log("Estatísticas do professor:", {
        totalTasks,
        averageGrade,
        overdueTasks,
        completedPercentage,
        inProgressPercentage,
        overduePercentage,
        dueSoonTasks,
        overallClassGrade,
      });

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
      console.error("Erro ao obter estatísticas do professor:", error);
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new TaskController();

function getErrorMessage(err: unknown) {
  throw new Error("Function not implemented");
}
