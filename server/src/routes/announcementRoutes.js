import express from "express";
import {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementsByCourse,
  getAnnouncementsByModule,
} from "../controllers/announcementController.js";
import {
  Auth,
  requireInstructorOrAdmin,
  requireAnyUser,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", Auth, requireInstructorOrAdmin, createAnnouncement);
router.get("/", Auth, requireAnyUser, getAllAnnouncements);
router.get("/course/:courseId", Auth, requireAnyUser, getAnnouncementsByCourse);
router.get("/module/:moduleId", Auth, requireAnyUser, getAnnouncementsByModule);

export default router;
