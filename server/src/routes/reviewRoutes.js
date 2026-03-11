import express from "express";
import {
  createReview,
  getAllReviews,
  getReviewsByCourse,
  getReviewsByStudent,
} from "../controllers/reviewController.js";
import {
  Auth,
  requireStudent,
  requireAnyUser,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", Auth, requireStudent, createReview);
router.get("/", Auth, requireAnyUser, getAllReviews);
router.get("/course/:courseId", Auth, requireAnyUser, getReviewsByCourse);
router.get("/student/:studentId", Auth, requireAnyUser, getReviewsByStudent);

export default router;
