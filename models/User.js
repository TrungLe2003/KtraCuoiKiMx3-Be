import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  address: String,
  identify: String,
  dob: Date,
  isDeleted: { type: Boolean, default: true },
  role: {
    type: String,
    enum: ["STUDENT", "TEACHER", "ADMIN"],
    required: true,
  },
});

const UserModel = mongoose.model("users", schema);

export default UserModel;
