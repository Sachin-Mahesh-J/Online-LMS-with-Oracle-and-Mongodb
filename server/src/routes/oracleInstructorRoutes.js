import express from "express";
import {
  getAllInstructors,
  getInstructorById,
  createInstructor,
} from "../controllers/oracleInstructorController.js";

const router = express.Router();

router.get("/", getAllInstructors);
router.get("/:id", getInstructorById);
router.post("/", createInstructor);

export default router;
