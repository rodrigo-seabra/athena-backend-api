// src/controllers/studentStats.controller.ts

import { Request, Response } from "express";
import StudentStats from "../models/StudentStats";
import { updateSubjectProficiency } from "../utils/stats.utils";
import Class from "../models/Class";
import { calculateGrowthProjection } from "../utils/growthProjection.utils";

class StudentStatsController {
    public async updateProficiency(req: Request, res: Response): Promise<Response> {
        try {
          const { userId, subjectName, newLevel } = req.body;
    
          if (!userId || !subjectName || newLevel === undefined) {
            return res.status(400).json({ message: "User ID, subject name, and new level are required." });
          }
    
          let studentStats = await StudentStats.findOne({ userId });
    
          if (studentStats) {
            // Atualiza as proficiências de assunto
            studentStats.subjects = updateSubjectProficiency(studentStats.subjects, subjectName, newLevel);
          } else {
            // Cria novo registro se não existir
            studentStats = new StudentStats({
              userId,
              subjects: [{
                name: subjectName,
                averageLevel: newLevel,
                activitiesCount: 1
              }]
            });
          }
    
          await studentStats.save();
          return res.status(200).json(studentStats);
        } catch (error) {
          console.error("Error updating proficiency:", error);
          return res.status(500).json({ message: "Error updating proficiency." });
        }
      }
  public async getProficiencyByUser(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
      }

      const studentStats = await StudentStats.findOne({ userId });

      if (!studentStats) {
        return res.status(404).json({ message: "Student stats not found." });
      }

      return res.status(200).json(studentStats.subjects);
    } catch (error) {
      console.error("Error retrieving proficiency:", error);
      return res.status(500).json({ message: "Error retrieving proficiency." });
    }
  }

  public async getProficiencyByClass(req: Request, res: Response): Promise<Response> {
    try {
      const { classId } = req.params;

      if (!classId) {
        return res.status(400).json({ message: "Class ID is required." });
      }

      const classData = await Class.findById(classId).populate('students');
      
      if (!classData) {
        return res.status(404).json({ message: "Class not found." });
      }

      const studentStats = await StudentStats.find({ userId: { $in: classData.students } });

      if (!studentStats || studentStats.length === 0) {
        return res.status(404).json({ message: "No student stats found for this class." });
      }

      const subjectLevels: { [key: string]: number[] } = {};
      const studentCount = studentStats.length;

      // Inicializa os níveis de cada matéria
      studentStats.forEach(stats => {
        stats.subjects.forEach(subject => {
          if (!subjectLevels[subject.name]) {
            subjectLevels[subject.name] = [];
          }
          subjectLevels[subject.name].push(subject.averageLevel);
        });
      });

      // Calcula a média e a contagem de alunos por nível
      const proficiencyReport = Object.keys(subjectLevels).map(subject => {
        const levels = subjectLevels[subject];
        const averageLevel = levels.reduce((acc, level) => acc + level, 0) / levels.length;

        const levelCounts = levels.reduce((acc, level) => {
          acc[level] = (acc[level] || 0) + 1;
          return acc;
        }, {} as { [key: number]: number });

        return {
          subject,
          averageLevel: averageLevel.toFixed(2),
          levelCounts,
          totalStudents: studentCount,
        };
      });

      const growthProjection = calculateGrowthProjection(proficiencyReport);

      return res.status(200).json({
        proficiencyReport,
        growthProjection,
      });
    } catch (error) {
      console.error("Error retrieving proficiency by class:", error);
      return res.status(500).json({ message: "Error retrieving proficiency." });
    }
  }
}

export default new StudentStatsController()

function getErrorMessage(err: unknown) {
    throw new Error("Function not implemented");
  }
  
