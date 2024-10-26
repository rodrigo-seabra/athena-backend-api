// src/controllers/studentStats.controller.ts

import { Request, Response } from "express";
import StudentStats from "../models/StudentStats";
import { updateSubjectProficiency } from "../utils/stats.utils";

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
}

export default new StudentStatsController()

function getErrorMessage(err: unknown) {
    throw new Error("Function not implemented");
  }
  
