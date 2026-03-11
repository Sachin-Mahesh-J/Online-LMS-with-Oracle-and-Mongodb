import express from "express";
import {
  getAllModules,
  getModuleById,
  getModulesByCourseId,
  createModule,
} from "../controllers/oracleModuleController.js";

const router = express.Router();

router.get("/", getAllModules);
router.get("/course/:courseId", getModulesByCourseId);
router.get("/:id", getModuleById);
router.post("/", createModule);

export default router;
