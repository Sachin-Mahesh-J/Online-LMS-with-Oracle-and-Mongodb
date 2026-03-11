import express from "express";
import {
  createSubmission,
  getAllSubmissions,
  getSubmissionsByStudent,
  getSubmissionsByCourse,
} from "../controllers/submissionController.js";

const router = express.Router();

router.post("/", createSubmission);
router.get("/", getAllSubmissions);
router.get("/student/:studentId", getSubmissionsByStudent);
router.get("/course/:courseId", getSubmissionsByCourse);

export default router;
