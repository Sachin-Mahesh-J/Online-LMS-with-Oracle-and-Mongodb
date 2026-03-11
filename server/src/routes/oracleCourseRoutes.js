import express from "express";
import {
  getAllCourses,
  getCourseById,
  createCourse,
} from "../controllers/oracleCourseController.js";

const router = express.Router();

router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.post("/", createCourse);

export default router;
