import { Schema, model, Document } from "mongoose";
import { ExperienceInterface } from "../interfaces/Experience.interface";

const ExperienceSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export interface ExperienceModel extends ExperienceInterface, Document {}
export default model<ExperienceModel>("Experience", ExperienceSchema);