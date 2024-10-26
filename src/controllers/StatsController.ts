import { Request, Response } from "express";
import Task from "../models/Task";
import Stats from "../models/Stats";
import Class from "../models/Class";

class StatsController {
  public async getPerformanceByClass(req: Request, res: Response): Promise<Response> {
    try {
      const { classId } = req.params;
  
      if (!classId) {
        return res.status(400).json({ message: "Class ID is required." });
      }
  
      const classes = await Class.find({}, '_id');
  
      // Gerar dados de desempenho únicos para cada classe
      const performanceDataByClassId: Record<string, any[]> = {};
      classes.forEach((cls) => {
        performanceDataByClassId[String(cls._id)] = [
          { name: "Nível 1", value: Math.floor(Math.random() * 30), color: "#FF5733" },
          { name: "Nível 2", value: Math.floor(Math.random() * 30), color: "#C70039" },
          { name: "Nível 3", value: Math.floor(Math.random() * 30), color: "#900C3F" },
          { name: "Nível 4", value: Math.floor(Math.random() * 30), color: "#581845" },
        ];
      });
  
      const performanceData = performanceDataByClassId[classId] || [
        { name: "Nível 1", value: 10, color: "#405480" },
        { name: "Nível 2", value: 22, color: "#235BD5" },
        { name: "Nível 3", value: 27, color: "#394255" },
        { name: "Nível 4", value: 27, color: "#004FFF" },
      ];
  
      return res.status(200).json(performanceData);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      return res.status(500).json({ message: "Error fetching performance data." });
    }
  }
  

  public async getStatsBySchool(req: Request, res: Response): Promise<Response> {
    try {
      const { IdSchool } = req.params; 

      if (!IdSchool) {
        return res.status(400).json({ message: "ID da escola não fornecido." });
      }

      const tasks = await Task.find({});
      const filteredTasks = tasks.filter(task => task.school === IdSchool);
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
        
        totalGrade += grades.reduce((acc, grade) => acc + (grade || 0), 0);
        totalGradesCount += grades.length;
      });

      const averageGrade = totalGradesCount > 0 ? totalGrade / totalGradesCount : null;

      const completedPercentage = (totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0).toFixed(2);
      const inProgressPercentage = (totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0).toFixed(2);
      const overduePercentage = (totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0).toFixed(2);
      const overallClassGrade = totalGradesCount > 0 ? totalGrade / totalGradesCount : null;

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
      console.error("Erro ao obter estatísticas da escola:", error);
      return res.status(500).json({ message: "Erro ao obter estatísticas da escola." });
    }
  }

  public async getStatsByClass(req: Request, res: Response): Promise<Response> {
    try {
      const { IdClass } = req.params; 

      if (!IdClass) {
        return res.status(400).json({ message: "ID da classe não fornecido." });
      }

      const tasks = await Task.find({ IdClass }); 
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
        
        totalGrade += grades.reduce((acc, grade) => acc + (grade || 0), 0);
        totalGradesCount += grades.length;
      });

      const averageGrade = totalGradesCount > 0 ? totalGrade / totalGradesCount : null;

      const completedPercentage = (totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0).toFixed(2);
      const inProgressPercentage = (totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0).toFixed(2);
      const overduePercentage = (totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0).toFixed(2);
      const overallClassGrade = totalGradesCount > 0 ? totalGrade / totalGradesCount : null;

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
      console.error("Erro ao obter estatísticas da classe:", error);
      return res.status(500).json({ message: "Erro ao obter estatísticas da classe." });
    }
  }

  public async getStatsByStudent(req: Request, res: Response): Promise<Response> {
    try {

      const { studentId } = req.params;
      if (!studentId) {
        return res.status(400).json({ message: "ID do aluno não fornecido." });
      }
      const userClass = await Class.findOne({ students: studentId });
      if (!userClass) {
        return res.status(404).json({ message: "Usuário não está em nenhuma classe." });
      }

      const tasks = await Task.find({ 
        recipients: userClass._id,  
      });


      if (!tasks.length) {
        return res.status(200).json({
          totalTasks: 0,
          averageGrade: null,
          overdueTasks: 0,
          completedPercentage: 0,
          inProgressPercentage: 0,
          overduePercentage: 0,
          dueSoonTasks: [],
        });
      }

      const totalTasks = tasks.length;
      let totalGrade = 0;
      let totalGradesCount = 0;
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
        const response = task.studentResponses?.find((resp) => resp.studentId === studentId);
        if (response) {
          if (response.grade !== undefined) {
            totalGrade += response.grade;
            totalGradesCount++;
          }
        }
        if (task.status === "pronto") completedTasks++;
        if (task.status === "em andamento") inProgressTasks++;
        if (task.dueDate < now) overdueTasks++;
      });

      const averageGrade = totalGradesCount > 0 ? totalGrade / totalGradesCount : null;

      const completedPercentage = (totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0).toFixed(2);
      const inProgressPercentage = (totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0).toFixed(2);
      const overduePercentage = (totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0).toFixed(2);

      return res.status(200).json({
        totalTasks,
        averageGrade,
        overdueTasks,
        completedPercentage,
        inProgressPercentage,
        overduePercentage,
        dueSoonTasks,
      });
    } catch (error: any) {
      console.error("Erro ao obter estatísticas do aluno:", error);
      return res.status(500).json({ message: "Erro ao obter estatísticas do aluno." });
    }
  }

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