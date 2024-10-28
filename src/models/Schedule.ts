import { Schema, model, Document } from "mongoose";
import { ScheduleInterface } from "../interfaces/Schedule.interface";

const ScheduleSchema = new Schema(
  {
    classId: {
      type: String,
      required: true,
    },
    scheduleItems: [
      {
        dayOfWeek: {
          type: Number, 
          required: true,
        },
        startTime: {
          type: String, // Horário de início no formato "HH:mm"
          required: true,
        },
        endTime: {
          type: String, // Horário de término no formato "HH:mm"
          required: true,
        },
        topic: {
          type: String,
          required: true,
        },
        resources: {
          type: [String], 
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export interface ScheduleModel extends ScheduleInterface, Document {}
export default model<ScheduleModel>("Schedule", ScheduleSchema);
