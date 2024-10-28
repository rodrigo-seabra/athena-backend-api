// src/controllers/AttendanceController.ts

import { Request, Response } from "express";
import Attendance from "../models/Attendance";
import Schedule from "../models/Schedule";
import { calculateAttendedClasses } from "../utils/calculateAttendedClasses";

class AttendanceController {

    public async register(req: Request, res: Response): Promise<Response> {
        const { studentId, classId, faceHash, entryTime, exitTime } = req.body;
    
        try {
          const attendance = new Attendance({
            studentId,
            classId,
            faceHash,
            entryTime,
            exitTime,
          });
    
          await attendance.save();
          return res.status(201).json({ message: "Presença registrada com sucesso!", attendance });
        } catch (error) {
          console.error("Erro ao registrar presença:", error);
          return res.status(500).json({ message: "Erro ao registrar presença." });
        }
      }

  async registerAttendance(req: Request, res: Response) {
    const { studentId, classId, entryTime, exitTime } = req.body;

    try {
      // Verifica se o cronograma existe para a turma
      const schedule = await Schedule.findOne({ classId });

      if (!schedule) {
        return res.status(404).json({ message: "Cronograma não encontrado." });
      }

      // Calcula as aulas participadas
      const attendedClasses = calculateAttendedClasses(new Date(entryTime), new Date(exitTime), schedule);

      // Cria o registro de presença
      const attendance = new Attendance({
        studentId,
        classId,
        date: new Date(),
        entryTime: new Date(entryTime),
        exitTime: new Date(exitTime),
        attendedClasses,
      });

      // Salva o registro no banco de dados
      await attendance.save();
      return res.status(201).json(attendance);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao registrar presença.", error });
    }
  }

  // Busca a presença de um aluno em uma data específica
  async getAttendanceByDate(req: Request, res: Response) {
    const { studentId, date } = req.params;

    try {
      const attendanceRecords = await Attendance.find({
        studentId,
        date: {
          $gte: new Date(new Date(date).setHours(0, 0, 0, 0)), // Início do dia
          $lt: new Date(new Date(date).setHours(23, 59, 59, 999)), // Fim do dia
        },
      });

      return res.status(200).json(attendanceRecords);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar registros de presença.", error });
    }
  }

  // Lista todas as presenças de um aluno em uma turma
  async getAttendanceByClass(req: Request, res: Response) {
    const { classId } = req.params;

    try {
      const attendanceRecords = await Attendance.find({ classId });
      return res.status(200).json(attendanceRecords);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar registros de presença.", error });
    }
  }
}

export default new AttendanceController();
