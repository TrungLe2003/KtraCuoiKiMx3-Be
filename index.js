import express from "express";
import mongoose from "mongoose";
import TeacherModel from "./models/Teacher.js";
import UserModel from "./models/User.js";
import cors from "cors";
import dotenv from "dotenv";
import TeacherPositionsModel from "./models/TeacherPosition.js";

dotenv.config();

await mongoose.connect(process.env.DATABASE_LINK).then(() => {
  console.log("Connected database!");
});
const app = express();
app.use(cors());
app.use(express.json());

app.get("", (req, res) => {
  res.send({
    message: "Connected!",
  });
});

app.get("/teachers", async (req, res) => {
  try {
    const page = parseInt(req.query.page); //trang hiện tại
    const limit = parseInt(req.query.limit); //số lượng phần tử 1 trang
    const skip = (page - 1) * limit; //vị trí phần tử bắt đầu trong mảng của trang hiện tại
    const totalTeachers = await TeacherModel.countDocuments();
    const totalPages = Math.ceil(totalTeachers / limit);
    const teachers = await TeacherModel.find()
      .populate("userId")
      .populate("teacherPositionsId")
      .select("code name isActive address degrees") // Lấy những cái cần của đề bài TeacherModel
      .skip(skip)
      /*vdu: 30 phần và muốn lấy từ trang 2 với mỗi trang 10 phần tử => skip = (2 - 1) * 10 = 10 (bỏ qua 10 phần tử đầu tiên).*/
      .limit(limit);
    // Còn thiếu những thông tin trong user với position:
    /* -duyệt qua từng teacher lấy thông tin chi tiết (email, phone,...)*/
    const result = teachers.map((teacher) => {
      const user = teacher.userId || {};
      const position = teacher.teacherPositionsId || {};

      return {
        code: teacher.code,
        name: user.name,
        email: user.email,
        identify: user.identify,
        phoneNumber: user.phoneNumber,
        isActive: teacher.isActive,
        address: user.address,
        position: position.name, // Lấy tên vị trí công tác
        degrees: teacher.degrees, // Danh sách các học vấn
      };
    });

    res.status(200).send({
      message: "Teacher list",
      data: result,
      pagination: {
        totalTeachers,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: null,
    });
  }
});

// POST: /teachers
app.post("/teachers", async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      address,
      identify,
      dob,
      teacherPosition,
      degrees, //này nhập vô 1 object
      role = "TEACHER",
    } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        message: "Email existed or invalid!",
      });
    }

    // Tạo 1 ng dùnfg mới
    const newUser = new UserModel({
      name,
      email,
      phoneNumber,
      address,
      identify,
      dob,
      role,
    });

    const createdUser = await newUser.save(); // Lưu người dùng vào UserModel

    // Sinh chuỗi số ngẫu nhiên -code (Mã giáo viên)
    const generateRandomCode = () => {
      return Math.floor(Math.random() * 10000000000).toString(); //10 số
    };
    const code = generateRandomCode();

    const findTeacherPosition = await TeacherPositionsModel.findOne({
      code: teacherPosition,
    });
    console.log(findTeacherPosition);
    console.log(findTeacherPosition._id);
    if (!findTeacherPosition) {
      return res.status(404).send({
        message: "teacherPosition invalid",
      });
    }

    // Tạo giáo viên mới - liên kết với user vừa tạo
    const newTeacher = new TeacherModel({
      userId: createdUser._id,
      code: code,
      startDate: new Date(),
      teacherPositionsId: findTeacherPosition._id,
      degrees,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdTeacher = await newTeacher.save();

    res.status(201).send({
      message: "Create teacher information successful!",
      data: createdTeacher,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: null,
    });
  }
});

app.get("/teacher-positions", async (req, res) => {
  try {
    const positionsData = await TeacherPositionsModel.find();
    res.status(201).send({
      message: "This is all teacher position!",
      data: positionsData,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: null,
    });
  }
});

app.post("/teacher-positions", async (req, res) => {
  try {
    const { name, code, des } = req.body;
    const newPositions = {
      name,
      code,
      des,
    };
    const positionsData = await TeacherPositionsModel.create(newPositions);
    res.status(201).send({
      message: "This is new teacher position!",
      data: positionsData,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: null,
    });
  }
});

app.listen(8080, () => {
  console.log("Server is running!");
});

/*
Create teacher: req.body
 {
  "name": "AA",
  "dob": "1990-01-01",
  "phoneNumber": "0123456789",
  "identify": "123456789",
  "address": "Hà Nội",
  "email": "nA@example.com",
  "teacherPosition": "TTS",
  "degrees": [
    {
      "type": "Cử nhân",
      "school": "Đại học Bách Khoa",
      "major": "Công nghệ thông tin",
      "year": 2015,
      "isGraduated": true
    }
  ]
}
*/
