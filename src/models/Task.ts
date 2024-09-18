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
    professorId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['em andamento', 'pronto'], 
  },
  class: {
    type: String,
  },
    studentResponses: [
      {
        studentId: {
          type: String,
          required: true,
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
