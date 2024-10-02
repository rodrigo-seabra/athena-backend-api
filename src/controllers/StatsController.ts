import { Request, Response } from "express";
import Task from "../models/Task";
import Stats from "../models/Stats";

class StatsController {
  public async generateAndSaveStats(req: Request, res: Response): Promise<Response> {
    try {
      const {
        taskId,
        totalResponses,
        averageGrade,
        completedPercentage,
        inProgressPercentage,
        overdueTasks,
        dueSoonTasks
      } = req.body;
  
      if (!taskId) {
        return res.status(400).json({ message: "ID da tarefa não fornecido." });
      }
  
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Tarefa não encontrada." });
      }
  
      const stats = new Stats({
        taskId,
        totalResponses,
        averageGrade,
        completedPercentage,
        inProgressPercentage,
        overdueTasks,
        dueSoonTasks,
      });
  
      await stats.save();
  
      return res.status(201).json({ message: "Estatísticas salvas com sucesso.", stats });
    } catch (error) {
      console.error("Erro ao salvar estatísticas:", error);
      return res.status(500).json({ message: "Erro ao salvar estatísticas." });
    }
  }

  public async getStatsByTask(req: Request, res: Response): Promise<Response> {
    try {
      const { taskId } = req.params;

      if (!taskId) {
        return res.status(400).json({ message: "ID da tarefa ou do usuário não fornecido." });
      }

      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Tarefa não encontrada." });
      }

      const totalResponses = task.studentResponses?.length || 0;
      const grades = task.studentResponses?.map(response => response.grade).filter(grade => grade !== undefined) || [];
      const totalGradesCount = grades.length;
      const averageGrade = totalGradesCount > 0 ? grades.reduce((sum, grade) => sum + grade, 0) / totalGradesCount : null;

      const completedPercentage = task.status === "pronto" ? 100 : 0;
      const inProgressPercentage = task.status === "em andamento" ? 100 : 0;
      const overdueTasks = task.dueDate < new Date() ? 1 : 0;
      const dueSoonTasks = task.dueDate > new Date() && task.dueDate <= new Date(Date.now() + 48 * 60 * 60 * 1000) ? 1 : 0;

      const stats = {
        taskId,
        totalResponses,
        averageGrade,
        completedPercentage,
        inProgressPercentage,
        overdueTasks,
        dueSoonTasks,
      };

      return res.status(200).json(stats);
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      return res.status(500).json({ message: "Erro ao obter estatísticas." });
    }
  }

  public async getTeacherStats(req: Request, res: Response): Promise<Response> {
    try {
      console.log("Obtendo estatísticas do professor...");

      const { IdTeacher } = req.params;
      console.log("ID do professor recebido:", IdTeacher);

      if (!IdTeacher) {
        console.log("Erro: Professor ID está faltando.");
        throw new Error("Professor ID está faltando");
      }

      const tasks = await Task.find({ IdTeacher });
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

export default new StatsController();

function getErrorMessage(err: unknown) {
  throw new Error("Function not implemented");
}