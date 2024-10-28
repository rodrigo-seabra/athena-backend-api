import { Request, Response } from "express";
import Schedule from "../models/Schedule";
import { ScheduleInterface } from "../interfaces/Schedule.interface";

class ScheduleController {
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { classId, scheduleItems } = req.body;

      if (!classId || !Array.isArray(scheduleItems) || scheduleItems.length === 0) {
        return res.status(400).json({ message: "classId e scheduleItems são obrigatórios" });
      }

      for (const item of scheduleItems) {
        const { dayOfWeek, startTime, endTime, topic } = item;
        
        if (
          typeof dayOfWeek !== "number" || dayOfWeek < 1 || dayOfWeek > 5 || // 1 para segunda, 5 para sexta
          typeof startTime !== "string" || !/^\d{2}:\d{2}$/.test(startTime) || // Validação básica de horário "HH:mm"
          typeof endTime !== "string" || !/^\d{2}:\d{2}$/.test(endTime) ||    // Validação básica de horário "HH:mm"
          typeof topic !== "string" || topic.trim() === ""
        ) {
          return res.status(400).json({ 
            message: "Cada item deve conter dayOfWeek (1 a 5), startTime, endTime (formato HH:mm), e topic válidos" 
          });
        }
      }

      const newSchedule: ScheduleInterface = {
        classId,
        scheduleItems,
      };

      const schedule = new Schedule(newSchedule);
      const savedSchedule = await schedule.save();

      return res.status(201).json(savedSchedule);
    } catch (error) {
      console.error("Erro ao criar cronograma:", error);
      return res.status(500).json({ message: "Erro ao criar cronograma" });
    }
  }

  public async getByClass(req: Request, res: Response): Promise<Response> {
    try {
      const { classId } = req.params;
      const schedule = await Schedule.findOne({ classId }).lean();
      if (!schedule) {
        return res.status(404).json({ message: "Cronograma não encontrado" });
      }
      return res.status(200).json(schedule);
    } catch (error) {
      console.error("Erro ao buscar cronograma:", error);
      return res.status(500).json({ message: "Erro ao buscar cronograma" });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { classId } = req.params;
      const { scheduleItems } = req.body;

      if (scheduleItems && Array.isArray(scheduleItems)) {
        for (const item of scheduleItems) {
          const { dayOfWeek, startTime, endTime, topic } = item;
          if (
            typeof dayOfWeek !== "number" || dayOfWeek < 1 || dayOfWeek > 5 ||
            typeof startTime !== "string" || !/^\d{2}:\d{2}$/.test(startTime) ||
            typeof endTime !== "string" || !/^\d{2}:\d{2}$/.test(endTime) ||
            typeof topic !== "string" || topic.trim() === ""
          ) {
            return res.status(400).json({ 
              message: "Cada item deve conter dayOfWeek (1 a 5), startTime, endTime (formato HH:mm), e topic válidos" 
            });
          }
        }
      }

      const updatedSchedule = await Schedule.findOneAndUpdate(
        { classId },
        { scheduleItems },
        { new: true }
      );

      if (!updatedSchedule) {
        return res.status(404).json({ message: "Cronograma não encontrado" });
      }
      return res.status(200).json(updatedSchedule);
    } catch (error) {
      console.error("Erro ao atualizar cronograma:", error);
      return res.status(500).json({ message: "Erro ao atualizar cronograma" });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { classId } = req.params;
      const deletedSchedule = await Schedule.findOneAndDelete({ classId });
      if (!deletedSchedule) {
        return res.status(404).json({ message: "Cronograma não encontrado" });
      }
      return res.status(200).json({ message: "Cronograma deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar cronograma:", error);
      return res.status(500).json({ message: "Erro ao deletar cronograma" });
    }
  }
}

export default new ScheduleController();
