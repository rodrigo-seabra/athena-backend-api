// src/controllers/AttendanceController.ts

import { Request, Response } from "express";
import Attendance from "../models/Attendance";
import Schedule from "../models/Schedule";
import { calculateAttendedClasses } from "../utils/calculateAttendedClasses";
import User from "../models/User";
import * as faceapi from "face-api.js";

class AttendanceController {

  public async registerAttendance(req: Request, res: Response): Promise<Response> {
    const { studentId, classId, descriptor } = req.body;

    try {
        const schedule = await Schedule.findOne({ classId });
        if (!schedule) {
            return res.status(404).json({ message: "Cronograma não encontrado." });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let attendance = await Attendance.findOne({ studentId, classId, date: today });

        if (attendance) {
            if (!attendance.exitTime) {
                attendance.exitTime = new Date();

                if (attendance.entryTime) {
                    attendance.attendedClasses = calculateAttendedClasses(
                        attendance.entryTime, 
                        attendance.exitTime, 
                        schedule
                    );
                }
            } else {
                return res.status(400).json({ message: "Saída já registrada para o dia." });
            }
        } else {
            const entryTime = new Date();
            attendance = new Attendance({
                studentId,
                classId,
                date: today,
                entryTime,
                exitTime: null,
                attendedClasses: 0,  
                attempts: 1,
            });
        }

        await attendance.save();
        return res.status(200).json({ message: "Presença registrada com sucesso!", attendance });
    } catch (error) {
        console.error("Erro ao registrar presença:", error);
        return res.status(500).json({ message: "Erro ao registrar presença." });
    }
}


public async registerWithFaceDescriptor(req: Request, res: Response): Promise<Response | any> {
    const { studentId, classId, descriptor } = req.body;
    const SIMILARITY_THRESHOLD = 0.6;

    if (!descriptor || !Array.isArray(descriptor)) {
        return res.status(400).json({ message: "Descriptor facial é obrigatório e deve ser um array." });
    }

    try {
        const student = await User.findById(studentId);
        if (!student || !student.image) {
            return res.status(404).json({ message: "Estudante ou descritor facial não encontrado." });
        }

        const studentDescriptor = JSON.parse(student.image);
        const distance = faceapi.euclideanDistance(descriptor, studentDescriptor);

        if (distance < SIMILARITY_THRESHOLD) {
            return this.registerAttendance(req, res);
        } else {
            return res.status(401).json({ message: "Falha no reconhecimento facial." });
        }
    } catch (error) {
        console.error("Erro ao registrar presença com reconhecimento facial:", error);
        return res.status(500).json({ message: "Erro ao processar o reconhecimento facial." });
    }
}

public async manualRegister(req: Request, res: Response): Promise<Response> {
    const { studentId, classId, entryTime, exitTime } = req.body;

    try {
        const schedule = await Schedule.findOne({ classId });
        if (!schedule) {
            return res.status(404).json({ message: "Cronograma não encontrado." });
        }

        const attendedClasses = calculateAttendedClasses(new Date(entryTime), new Date(exitTime), schedule);

        const attendance = new Attendance({
            studentId,
            classId,
            date: new Date(),
            entryTime: new Date(entryTime),
            exitTime: new Date(exitTime),
            attendedClasses,
            attempts: 1,
        });

        await attendance.save();
        return res.status(201).json({ message: "Presença registrada manualmente com sucesso!", attendance });
    } catch (error) {
        console.error("Erro ao registrar manualmente:", error);
        return res.status(500).json({ message: "Erro ao registrar presença manualmente." });
    }
}

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

  async registerAttendanceManual(req: Request, res: Response) {
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
