import { Schema, model, Document } from "mongoose";
import { TaskInterface } from "../interfaces/Task.interface";

const TaskSchema = new Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    recipients: {
      type: [String],
      required: true,
    },
    attachment: {
      type: [String],
    },
    IdTeacher: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["em andamento", "pronto", "cancelada", "atrasada", "pendente"],
    },
    IdClass: {
      type: String,
    },
    school: {
      type: String,
    },
    alternatives: [
      {
        text: {
          type: String,
        },
        isCorrect: {
          type: Boolean,
        },
      },
    ],
    studentResponses: [
      {
        studentId: {
          type: String,
          required: true,
        },
        studentName: {
          type: String,
        },
        selectedAlternative: {
          type: String,
        },
        responseContent: {
          type: String,
          required: true,
        },
        attachment: {
          type: [String],
        },
        submissionDate: {
          type: Date,
        },
        graded: {
          type: Boolean,
        },
        grade: {
          type: Number,
        },
        feedback: {
          type: String,
        },
      },
    ],
    studentStatus: [
      {
        studentId: {
          type: String,
        },
        studentName: {
          type: String,
        },
        status: {
          type: String,
          enum: ["em andamento", "pronto", "atrasada"],
          default: "em andamento", 
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export interface TaskModel extends TaskInterface, Document {}
export default model<TaskModel>("Task", TaskSchema);
