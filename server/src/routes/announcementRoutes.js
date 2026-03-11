import express from "express";
import {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementsByCourse,
  getAnnouncementsByModule,
} from "../controllers/announcementController.js";

const router = express.Router();

router.post("/", createAnnouncement);
router.get("/", getAllAnnouncements);
router.get("/course/:courseId", getAnnouncementsByCourse);
router.get("/module/:moduleId", getAnnouncementsByModule);

export default router;
