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

    private isTimeWithinRange(entryTime: string, exitTime: string, startTime: string, endTime: string): boolean {
    const entryDate = new Date(`1970-01-01T${entryTime}:00`);
    const exitDate = new Date(`1970-01-01T${exitTime}:00`);
    const startDate = new Date(`1970-01-01T${startTime}:00`);
    const endDate = new Date(`1970-01-01T${endTime}:00`);

    return entryDate >= startDate && exitDate <= endDate;
  }

  private async getClassCountForDay(classId: string, dayOfWeek: number): Promise<number> {
    const schedule = await Schedule.findOne({ classId });
    if (!schedule) return 0;

    const classCount = schedule.scheduleItems.filter(item => item.dayOfWeek === dayOfWeek).length;
    return classCount;
}


public getAttendanceStats = async (req: Request, res: Response): Promise<Response> => {
  const { studentId } = req.params;

  // Defina os horários de início e término (exemplo: 08:00 a 17:00)
  const startTime = "08:00"; // Horário de entrada
  const endTime = "17:00"; // Horário de saída

  try {
      const attendanceRecords = await Attendance.find({ studentId });
      if (!attendanceRecords.length) {
          return res.status(404).json({ message: "Nenhum registro de presença encontrado para este aluno." });
      }

      const attendanceByDate = attendanceRecords.reduce((acc, record) => {
          const date = record.date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
          const dayOfWeek = new Date(date).getDay(); // Obtém o dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)

          // Ajuste para garantir que dia da semana esteja entre 1 e 5
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
              if (!acc[date]) {
                  acc[date] = { entryTime: record.entryTime, exitTime: record.exitTime, classId: record.classId, dayOfWeek };
              }
          }
          return acc;
      }, {} as Record<string, any>);

      const attendanceStats = await Promise.all(
          Object.keys(attendanceByDate).map(async (date) => {
              const attendanceInfo = attendanceByDate[date];
              const { classId, dayOfWeek } = attendanceInfo;

              // Busca o total de aulas apenas para dias úteis
              const classCount = await this.getClassCountForDay(classId, dayOfWeek);

              // Busca os tópicos da aula correspondente para o dia da semana
              const topics = await this.getTopicsByClassId(classId, dayOfWeek);

              const entryHHmm = attendanceInfo.entryTime ? attendanceInfo.entryTime.toTimeString().slice(0, 5) : null;
              const exitHHmm = attendanceInfo.exitTime ? attendanceInfo.exitTime.toTimeString().slice(0, 5) : null;

              if (!entryHHmm) {
                  return { date, status: "Horário de entrada não registrado" };
              }

              const attended = this.isTimeWithinRange(entryHHmm, exitHHmm || entryHHmm, startTime, endTime); // Verifica se o aluno esteve presente

              return {
                  date,
                  dayOfWeek: dayOfWeek + 1, // Ajuste para retornar de 1 (Segunda) a 5 (Sexta)
                  attendedClasses: attended ? 1 : 0,
                  totalClasses: classCount, // Total de aulas para aquele dia
                  topics, // Inclui os tópicos obtidos
              };
          })
      );

      // Filtra os resultados para remover dias inválidos
      const validAttendanceStats = attendanceStats.filter(stat => stat.dayOfWeek >= 1 && stat.dayOfWeek <= 5);

      return res.status(200).json(validAttendanceStats);
  } catch (error) {
      console.error("Erro ao buscar estatísticas de presença:", error);
      return res.status(500).json({ message: "Erro ao buscar estatísticas de presença." });
  }
}

// Método para buscar os tópicos da aula pelo classId e dayOfWeek
private getTopicsByClassId = async (classId: string, dayOfWeek: number): Promise<string[]> => {
  const schedule = await Schedule.findOne({ classId }); // Ajuste conforme seu modelo
  if (!schedule) return [];

  // Filtra os itens do cronograma de acordo com o dia da semana
  const scheduleItemsForDay = schedule.scheduleItems.filter(item => item.dayOfWeek === dayOfWeek);
  return scheduleItemsForDay.map(item => item.topic).filter(Boolean);
}

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
            attendance.attendedClasses = this.calculateAttendedClasses(
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
            attendance.attendedClasses = this.calculateAttendedClasses(
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

  private calculateAttendedClasses(entryTime: Date, exitTime: Date, schedule: any) {
    const entryHHmm = entryTime.toTimeString().slice(0, 5); // "HH:mm"
    const exitHHmm = exitTime.toTimeString().slice(0, 5); // "HH:mm"
    let attendedClasses = 0;

    for (const item of schedule.scheduleItems) {
      const { dayOfWeek, startTime, endTime } = item;

      if (new Date().getDay() === dayOfWeek) {
        if (this.isTimeWithinRange(entryHHmm, exitHHmm, startTime, endTime)) {
          attendedClasses += 1;
        }
      }
    }

    return attendedClasses;
  }

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
