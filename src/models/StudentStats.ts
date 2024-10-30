import { Schema, model, Document, Types } from "mongoose";
import { StudentStatsInterface, SubjectProficiency, PastStat } from "../interfaces/StudentStats.Interface";

const SubjectProficiencySchema = new Schema<SubjectProficiency>({
  name: { type: String, required: true },
  averageLevel: { type: Number, required: true },
  activitiesCount: { type: Number, default: 0 }
});

const pastStatSchema = new Schema<PastStat>({
  semester: { type: String, required: true },
  subjects: [SubjectProficiencySchema]
});

const StudentStatsSchema = new Schema<StudentStatsInterface & Document>(
  {
    userId: {
      type: Schema.Types.ObjectId, 
      ref: "User",
      required: true,
      unique: true
    },
    subjects: [SubjectProficiencySchema],
    pastStat: [pastStatSchema]
  },

  {
    timestamps: true
  }
);

export interface StudentStatsModel extends Document, StudentStatsInterface {}
export default model<StudentStatsModel>("StudentStats", StudentStatsSchema);
