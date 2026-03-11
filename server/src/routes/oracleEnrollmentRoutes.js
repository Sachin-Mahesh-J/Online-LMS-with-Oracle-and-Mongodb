import express from "express";
import {
  getAllEnrollments,
  getEnrollmentById,
  getEnrollmentsByStudentId,
  getEnrollmentsByCourseId,
  createEnrollment,
  updateEnrollment,
} from "../controllers/oracleEnrollmentController.js";
import {
  Auth,
  requireAnyUser,
  requireInstructorOrAdmin,
  requireStudent,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", Auth, requireInstructorOrAdmin, getAllEnrollments);
router.get(
  "/student/:studentId",
  Auth,
  requireAnyUser,
  getEnrollmentsByStudentId,
);
router.get(
  "/course/:courseId",
  Auth,
  requireInstructorOrAdmin,
  getEnrollmentsByCourseId,
);
router.get("/:id", Auth, requireInstructorOrAdmin, getEnrollmentById);
router.post("/", Auth, requireStudent, createEnrollment);
router.put("/:id", Auth, requireInstructorOrAdmin, updateEnrollment);

export default router;
