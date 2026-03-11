import express from "express";
import {
  getAllCourses,
  getCourseById,
  createCourse,
  getStudentsByCourse,
} from "../controllers/oracleCourseController.js";

const router = express.Router();

router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.get("/:id/students", getStudentsByCourse);
router.post("/", createCourse);

export default router;
