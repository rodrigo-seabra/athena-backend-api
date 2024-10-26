import { Schema, model, Document, Types } from "mongoose";
import { StudentStatsInterface, SubjectProficiency } from "../interfaces/StudentStats.Interface";

const SubjectProficiencySchema = new Schema<SubjectProficiency>({
  name: { type: String, required: true },
  averageLevel: { type: Number, required: true },
  activitiesCount: { type: Number, default: 0 }
});

const StudentStatsSchema = new Schema<StudentStatsInterface & Document>(
  {
    userId: {
      type: Schema.Types.ObjectId, 
      ref: "User",
      required: true,
      unique: true
    },
    subjects: [SubjectProficiencySchema]
  },
  {
    timestamps: true
  }
);

export interface StudentStatsModel extends Document, StudentStatsInterface {}
export default model<StudentStatsModel>("StudentStats", StudentStatsSchema);
