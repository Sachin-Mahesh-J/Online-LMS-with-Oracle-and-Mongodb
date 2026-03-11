import express from "express";
import cors from "cors";
import forumRoutes from "./routes/forumRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import oracleInstructorRoutes from "./routes/oracleInstructorRoutes.js";
import oracleCourseRoutes from "./routes/oracleCourseRoutes.js";
import oracleModuleRoutes from "./routes/oracleModuleRoutes.js";
import oracleStudentRoutes from "./routes/oracleStudentRoutes.js";
import oracleEnrollmentRoutes from "./routes/oracleEnrollmentRoutes.js";
import oraclePaymentRoutes from "./routes/oraclePaymentRoutes.js";
import oracleCertificationRoutes from "./routes/oracleCertificationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(uploadsDir));

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/forum-posts", forumRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/oracle/instructors", oracleInstructorRoutes);
app.use("/api/oracle/courses", oracleCourseRoutes);
app.use("/api/oracle/modules", oracleModuleRoutes);
app.use("/api/oracle/students", oracleStudentRoutes);
app.use("/api/oracle/enrollments", oracleEnrollmentRoutes);
app.use("/api/oracle/payments", oraclePaymentRoutes);
app.use("/api/oracle/certifications", oracleCertificationRoutes);

export default app;
