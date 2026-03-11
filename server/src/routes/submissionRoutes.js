import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  createSubmission,
  getAllSubmissions,
  getSubmissionsByStudent,
  getSubmissionsByCourse,
  getSubmissionById,
} from "../controllers/submissionController.js";
import {
  Auth,
  requireStudent,
  requireInstructorOrAdmin,
  requireAnyUser,
} from "../middleware/authMiddleware.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const submissionsUploadDir = path.join(
  __dirname,
  "..",
  "..",
  "uploads",
  "submissions",
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      fs.mkdirSync(submissionsUploadDir, { recursive: true });
      cb(null, submissionsUploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

router.post("/", Auth, requireStudent, upload.single("file"), createSubmission);
router.get("/", Auth, requireInstructorOrAdmin, getAllSubmissions);
router.get(
  "/student/:studentId",
  Auth,
  requireAnyUser,
  getSubmissionsByStudent,
);
router.get(
  "/course/:courseId",
  Auth,
  requireInstructorOrAdmin,
  getSubmissionsByCourse,
);

router.get("/:id", Auth, requireAnyUser, getSubmissionById);

export default router;
