
import { Schema, model } from "mongoose";
import { AttendanceInterface } from "../interfaces/Attendance.interface";

const AttendanceSchema = new Schema<AttendanceInterface>(
  {
    studentId: {
      type: String,
      required: true,
    },
    classId: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    entryTime: {
      type: Date,
    },
    exitTime: {
      type: Date,
    },
    attendedClasses: {
      type: Number,
      default: 0,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    recognitionCode: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default model<AttendanceInterface>("Attendance", AttendanceSchema);
