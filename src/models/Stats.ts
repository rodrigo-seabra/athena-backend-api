import { Schema, model, Document } from "mongoose";
import { StatsInterface } from "../interfaces/Stats.inteface";

const StatsSchema = new Schema(
  {
    IdTask: {
      type: String,
      required: true,
    },
    totalResponses: {
      type: Number,
    },
    averageGrade: 
      {
        type: Number
      },
      completedPercentage: 
      {
        type: Number,
      },
      inProgressPercentage: {
      type: Number,

    },
    overDue: {
      type: Number,
    },
    dueSoonTasks: {
      type: Number,
    },
  },
  {
    timestamps: true, 
  }
);


export interface StatsModel extends StatsInterface, Document {}
export default model<StatsModel>("Stats", StatsSchema);
