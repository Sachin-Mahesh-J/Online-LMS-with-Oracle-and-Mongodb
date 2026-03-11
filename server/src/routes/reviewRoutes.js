import express from "express";
import {
  createReview,
  getAllReviews,
  getReviewsByCourse,
  getReviewsByStudent,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", createReview);
router.get("/", getAllReviews);
router.get("/course/:courseId", getReviewsByCourse);
router.get("/student/:studentId", getReviewsByStudent);

export default router;
