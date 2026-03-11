import express from "express";
import {
  getAllPayments,
  getPaymentById,
  getPaymentsByEnrollmentId,
  createPayment,
} from "../controllers/oraclePaymentController.js";

const router = express.Router();

router.get("/", getAllPayments);
router.get("/enrollment/:enrollmentId", getPaymentsByEnrollmentId);
router.get("/:id", getPaymentById);
router.post("/", createPayment);

export default router;
