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

  private isTimeWithinRange(
    entryTime: string,
    exitTime: string,
    startTime: string,
    endTime: string
  ): boolean {
    const entryDate = new Date(`1970-01-01T${entryTime}:00`);
    const exitDate = new Date(`1970-01-01T${exitTime}:00`);
    const startDate = new Date(`1970-01-01T${startTime}:00`);
    const endDate = new Date(`1970-01-01T${endTime}:00`);

    return entryDate >= startDate && exitDate <= endDate;
  }

  public async getOverallAttendanceRate(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { studentId } = req.params;

    try {
      const attendanceRecords = await Attendance.find({ studentId });
      const totalClasses = attendanceRecords.reduce(
        (acc, record) => acc + (record.totalClasses || 0),
        0
      );
      const attendedClasses = attendanceRecords.reduce(
        (acc, record) => acc + (record.attendedClasses ?? 0),
        0
      );
      

      const attendanceRate = (attendedClasses / totalClasses) * 100;

      return res.status(200).json({ attendanceRate });
    } catch (error) {
      console.error("Erro ao calcular taxa de presença:", error);
      return res
        .status(500)
        .json({ message: "Erro ao calcular taxa de presença." });
    }
  }

  public async getAttendanceByClass(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { classId } = req.params;

    try {
      const attendanceRecords = await Attendance.find({ classId });
      if (!attendanceRecords.length) {
        return res
          .status(404)
          .json({
            message: "Nenhum registro de presença encontrado para esta classe.",
          });
      }

      const studentIds = attendanceRecords.map((record) => record.studentId);
      const users = await User.find({ _id: { $in: studentIds } });
      const classSchedule = await Schedule.findOne({ classId });

      if (!classSchedule) {
        return res
          .status(404)
          .json({ message: "Cronograma não encontrado para esta classe." });
      }

      const attendanceMap = new Map<string, any>();

      attendanceRecords.forEach((record) => {
        const user = users.find(
          (u) => String(u._id) === record.studentId.toString()
        );
        const dayOfWeek = new Date(record.date).getDay();

        if (!attendanceMap.has(record.studentId)) {
          attendanceMap.set(record.studentId, {
            userName: user ? user.name : "Usuário não encontrado",
            records: [],
          });
        }

        const totalClassesForDay = classSchedule.scheduleItems.filter(
          (item) => item.dayOfWeek === dayOfWeek
        ).length;
        const topics = classSchedule.scheduleItems
          .filter((item) => item.dayOfWeek === dayOfWeek)
          .map((item) => item.topic);

        attendanceMap.get(record.studentId)?.records.push({
          date: record.date,
          entryTime: record.entryTime,
          exitTime: record.exitTime,
          attendedClasses: record.attendedClasses,
          totalClasses: totalClassesForDay,
          topics: topics.length ? topics : ["Nenhum tópico encontrado"],
        });
      });

      const attendanceDetails = Array.from(attendanceMap.values());
      return res.status(200).json(attendanceDetails);
    } catch (error) {
      console.error("Erro ao buscar registros de presença:", error);
      return res
        .status(500)
        .json({ message: "Erro ao buscar registros de presença." });
    }
  }

  public async registerAttendance(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { studentId, classId } = req.body;

    try {
      const schedule = await Schedule.findOne({ classId });
      if (!schedule) {
        return res.status(404).json({ message: "Cronograma não encontrado." });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let attendance = await Attendance.findOne({
        studentId,
        classId,
        date: today,
      });

      const dayOfWeek = today.getDay();
      const totalClasses = schedule.scheduleItems.filter(
        (item) => item.dayOfWeek === dayOfWeek
      ).length;

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
          return res
            .status(400)
            .json({ message: "Saída já registrada para o dia." });
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
          totalClasses,
          attempts: 1,
        });
      }

      await attendance.save();
      return res
        .status(200)
        .json({ message: "Presença registrada com sucesso!", attendance });
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
      let attendance = await Attendance.findOne({
        studentId,
        classId,
        date: today,
      });
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
          return res
            .status(400)
            .json({ message: "Saída já registrada para o dia." });
        }
      } else {
        const entryTime = new Date();
        const dayOfWeek = new Date().getDay();
        const totalClasses = schedule.scheduleItems.filter(
          (item) => item.dayOfWeek === dayOfWeek
        ).length;

        attendance = new Attendance({
          studentId,
          classId,
          date: today,
          entryTime,
          exitTime: null,
          attendedClasses: 0,
          totalClasses,
          attempts: 1,
        });
      }

      await attendance.save();
      return res
        .status(200)
        .json({ message: "Presença registrada com sucesso!", attendance });
    } catch (error) {
      console.error("Erro ao registrar presença:", error);
      return res.status(500).json({ message: "Erro ao registrar presença." });
    }
  }

  private calculateAttendedClasses(
    entryTime: Date,
    exitTime: Date,
    schedule: any
  ) {
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

  public registerWithFaceDescriptor = async (
    req: Request,
    res: Response
  ): Promise<Response | any> => {
    const { studentId, descriptor } = req.body;
    const SIMILARITY_THRESHOLD = 0.6;

    if (!descriptor || !Array.isArray(descriptor)) {
      return res
        .status(400)
        .json({
          message: "Descriptor facial é obrigatório e deve ser um array.",
        });
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
        return res
          .status(400)
          .json({ message: "Descritor facial do estudante inválido." });
      }

      const distance = faceapi.euclideanDistance(descriptor, studentDescriptor);
      console.log(`Distância calculada: ${distance}`);

      if (distance < SIMILARITY_THRESHOLD) {
        const studentClass = await Class.findOne({ students: studentId });
        if (!studentClass) {
          return res
            .status(404)
            .json({ message: "Classe do estudante não encontrada." });
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
        return res
          .status(401)
          .json({ message: "Falha no reconhecimento facial." });
      }
    } catch (error) {
      console.error(
        "Erro ao registrar presença com reconhecimento facial:",
        error
      );
      return res
        .status(500)
        .json({ message: "Erro ao processar o reconhecimento facial." });
    }
  };

  public async manualRegister(req: Request, res: Response): Promise<Response> {
    const { studentId, classId, entryTime, exitTime } = req.body;

    try {
      const schedule = await Schedule.findOne({ classId });
      if (!schedule) {
        return res.status(404).json({ message: "Cronograma não encontrado." });
      }

      const attendedClasses = this.calculateAttendedClasses(
        new Date(entryTime || Date.now()),
        new Date(exitTime || Date.now()),
        schedule
      );
      const dayOfWeek = new Date().getDay();
      const totalClasses = schedule.scheduleItems.filter(
        (item) => item.dayOfWeek === dayOfWeek
      ).length;

      const attendance = new Attendance({
        studentId,
        classId,
        date: new Date(),
        entryTime: entryTime ? new Date(entryTime) : new Date(),
        exitTime: exitTime ? new Date(exitTime) : undefined,
        attendedClasses,
        totalClasses,
        attempts: 1,
      });

      await attendance.save();
      return res
        .status(201)
        .json({
          message: "Presença registrada manualmente com sucesso!",
          attendance,
        });
    } catch (error) {
      console.error("Erro ao registrar manualmente:", error);
      return res
        .status(500)
        .json({ message: "Erro ao registrar presença manualmente." });
    }
  }

  public async getAttendanceByDate(
    req: Request,
    res: Response
  ): Promise<Response> {
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
      return res
        .status(500)
        .json({ message: "Erro ao buscar registros de presença." });
    }
  }
}

export default new AttendanceController();
