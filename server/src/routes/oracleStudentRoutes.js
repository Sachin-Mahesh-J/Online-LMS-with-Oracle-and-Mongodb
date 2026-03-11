import express from "express";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  getStudentTotalPayments,
  deleteStudent,
} from "../controllers/oracleStudentController.js";
import {
  Auth,
  requireAdmin,
  requireAnyUser,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin-only: list all, create, delete
router.get("/", Auth, requireAdmin, getAllStudents);
router.post("/", Auth, requireAdmin, createStudent);

// More specific route must come before /:id
router.get("/:id/total-payments", Auth, requireAnyUser, getStudentTotalPayments);
router.get("/:id", Auth, requireAdmin, getStudentById);
router.delete("/:id", Auth, requireAdmin, deleteStudent);

export default router;
