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
      enum: ["em andamento", "pronto"],
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
  },
  {
    timestamps: true,
  }
);

export interface TaskModel extends TaskInterface, Document {}
export default model<TaskModel>("Task", TaskSchema);
