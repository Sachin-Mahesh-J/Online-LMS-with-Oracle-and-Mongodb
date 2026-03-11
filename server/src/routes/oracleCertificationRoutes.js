import express from "express";
import {
  getAllCertifications,
  getCertificationById,
  getCertificationByEnrollmentId,
  createCertification,
} from "../controllers/oracleCertificationController.js";

const router = express.Router();

router.get("/", getAllCertifications);
router.get("/enrollment/:enrollmentId", getCertificationByEnrollmentId);
router.get("/:id", getCertificationById);
router.post("/", createCertification);

export default router;
