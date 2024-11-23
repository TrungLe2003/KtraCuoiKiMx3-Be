import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  des: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: true },
});

const TeacherPositionsModel = mongoose.model("teacherpositions", schema);

export default TeacherPositionsModel;
