import mongoose from "mongoose";

const DegreeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  school: { type: String, required: true },
  major: { type: String, required: true },
  year: { type: Number, required: true },
  isGraduated: { type: Boolean, required: true },
});

const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  code: String,
  startDate: Date,
  endDate: Date,
  teacherPositionsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teacherpositions",
  },
  degrees: [DegreeSchema],
  createdAt: Date,
  updatedAt: Date,
});

const TeacherModel = mongoose.model("teachers", schema);

export default TeacherModel;
