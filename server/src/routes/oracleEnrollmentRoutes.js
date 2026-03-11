import express from "express";
import {
  getAllEnrollments,
  getEnrollmentById,
  getEnrollmentsByStudentId,
  getEnrollmentsByCourseId,
  createEnrollment,
  updateEnrollment,
} from "../controllers/oracleEnrollmentController.js";

const router = express.Router();

router.get("/", getAllEnrollments);
router.get("/student/:studentId", getEnrollmentsByStudentId);
router.get("/course/:courseId", getEnrollmentsByCourseId);
router.get("/:id", getEnrollmentById);
router.post("/", createEnrollment);
router.put("/:id", updateEnrollment);

export default router;
