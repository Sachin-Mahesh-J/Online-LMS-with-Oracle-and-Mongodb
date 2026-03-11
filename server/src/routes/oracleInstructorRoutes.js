import express from "express";
import {
  getAllInstructors,
  getInstructorById,
  createInstructor,
  deleteInstructor,
} from "../controllers/oracleInstructorController.js";
import { Auth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", Auth, requireAdmin, getAllInstructors);
router.get("/:id", Auth, requireAdmin, getInstructorById);
router.post("/", Auth, requireAdmin, createInstructor);
router.delete("/:id", Auth, requireAdmin, deleteInstructor);

export default router;
