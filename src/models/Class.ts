import { Schema, model, Document } from "mongoose";
import { ClassInterface } from "../interfaces/Class.interface";
import { UsersInterface } from "../interfaces/User.interface";

const ClassSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    teacher: [
      {
        type: String
      },
    ],
    students: [
      {
        type: String,
      },
    ],
    IdSchool: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    subject: {
      type: [String],
      required: true,
    },
    pendingRequests:[{
      id: { type: String},
      name: { type: String},
      cpf: { type: String},
    }]
  },
  {
    timestamps: true, 
  }
);


export interface ClassModel extends ClassInterface, Document {}
export default model<ClassModel>("Class", ClassSchema);
