// src/controllers/AttendanceController.ts

import { Request, Response } from "express";
import Attendance from "../models/Attendance";
import Schedule from "../models/Schedule";
import { calculateAttendedClasses } from "../utils/calculateAttendedClasses";
import User from "../models/User";
import * as faceapi from "face-api.js";
import Class from "../models/Class";

class AttendanceController {
  private studentId!: any;
  private classId!: any;

  // Função para registrar presença com base em entrada e saída
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

  // Função auxiliar para cadastro de presença
  private async cadastro(req: Request, res: Response): Promise<Response> {
    const classId = this.classId;
    const studentId = this.studentId;

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

  // Função para registro com reconhecimento facial
  public registerWithFaceDescriptor = async (req: Request, res: Response): Promise<Response | any> => {
    const { studentId, descriptor } = req.body;
    const SIMILARITY_THRESHOLD = 0.6;

    if (!descriptor || !Array.isArray(descriptor)) {
      return res.status(400).json({ message: "Descriptor facial é obrigatório e deve ser um array." });
    }

    try {
      const student = await User.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Estudante não encontrado." });
      }
      if (!student.image) {
        return res.status(404).json({ message: "Imagem não encontrada." });
      }

      let studentDescriptor;
      try {
        studentDescriptor = JSON.parse(student.image);
        if (!Array.isArray(studentDescriptor)) {
          throw new Error("Descritor facial do estudante não é um array.");
        }
      } catch (error) {
        return res.status(400).json({ message: "Descritor facial do estudante inválido." });
      }

      const distance = faceapi.euclideanDistance(descriptor, studentDescriptor);
      console.log(`Distância calculada: ${distance}`);

      if (distance < SIMILARITY_THRESHOLD) {
        const studentClass = await Class.findOne({ students: studentId });
        if (!studentClass) {
          return res.status(404).json({ message: "Classe do estudante não encontrada." });
        }

        console.log(`ID da classe encontrada: ${studentClass._id}`);

        const schedule = await Schedule.findOne({ classId: studentClass._id });

        if (schedule) {
          this.classId = studentClass._id;
          this.studentId = studentId;
          return this.cadastro(req, res);
        }
        return res.status(404).json({ message: "Cronograma não encontrado." });
      } else {
        return res.status(401).json({ message: "Falha no reconhecimento facial." });
      }
    } catch (error) {
      console.error("Erro ao registrar presença com reconhecimento facial:", error);
      return res.status(500).json({ message: "Erro ao processar o reconhecimento facial." });
    }
  };

  public async manualRegister(req: Request, res: Response): Promise<Response> {
    const { studentId, classId, entryTime, exitTime } = req.body;

    try {
      const schedule = await Schedule.findOne({ classId });
      if (!schedule) {
        return res.status(404).json({ message: "Cronograma não encontrado." });
      }

      const attendedClasses = calculateAttendedClasses(new Date(entryTime || Date.now()), new Date(exitTime || Date.now()), schedule);

      const attendance = new Attendance({
        studentId,
        classId,
        date: new Date(),
        entryTime: entryTime ? new Date(entryTime) : new Date(),
        exitTime: exitTime ? new Date(exitTime) : undefined,
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

  // Busca a presença de um aluno em uma data específica
  public async getAttendanceByDate(req: Request, res: Response): Promise<Response> {
    const { studentId } = req.params;
    const { date } = req.body;

    try {
      const attendanceRecords = await Attendance.find({
        studentId,
        date: {
          $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          $lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
        },
      });

      return res.status(200).json(attendanceRecords);
    } catch (error) {
      console.error("Erro ao buscar registros de presença:", error);
      return res.status(500).json({ message: "Erro ao buscar registros de presença." });
    }
  }

  // Lista todas as presenças de um aluno em uma turma
  public async getAttendanceByClass(req: Request, res: Response): Promise<Response> {
    const { classId } = req.params;

    try {
      const attendanceRecords = await Attendance.find({ classId });
      return res.status(200).json(attendanceRecords);
    } catch (error) {
      console.error("Erro ao buscar registros de presença:", error);
      return res.status(500).json({ message: "Erro ao buscar registros de presença." });
    }
  }
}

export default new AttendanceController();
