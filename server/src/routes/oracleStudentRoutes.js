import express from "express";
import {
  getAllStudents,
  getStudentById,
  createStudent,
} from "../controllers/oracleStudentController.js";

const router = express.Router();

router.get("/", getAllStudents);
router.get("/:id", getStudentById);
router.post("/", createStudent);

export default router;
