import express from "express";
import {
  getAllCertifications,
  getCertificationById,
  getCertificationByEnrollmentId,
  getCertificationsByStudentId,
  getCertificationsByCourseId,
  createCertification,
} from "../controllers/oracleCertificationController.js";
import {
  Auth,
  requireAnyUser,
  requireInstructorOrAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// List all certifications - instructors/admins only
router.get("/", Auth, requireInstructorOrAdmin, getAllCertifications);

// Student can view only their own certifications (controller enforces ownership)
router.get(
  "/student/:studentId",
  Auth,
  requireAnyUser,
  getCertificationsByStudentId,
);

// Instructors/admins can monitor certifications for their courses
router.get(
  "/course/:courseId",
  Auth,
  requireInstructorOrAdmin,
  getCertificationsByCourseId,
);

// Detailed certificate lookups are restricted to instructors/admins
router.get(
  "/enrollment/:enrollmentId",
  Auth,
  requireInstructorOrAdmin,
  getCertificationByEnrollmentId,
);
router.get(
  "/:id",
  Auth,
  requireInstructorOrAdmin,
  getCertificationById,
);

// Certificate issuance uses Oracle PL/SQL and is restricted to instructors/admins
router.post("/", Auth, requireInstructorOrAdmin, createCertification);

export default router;
