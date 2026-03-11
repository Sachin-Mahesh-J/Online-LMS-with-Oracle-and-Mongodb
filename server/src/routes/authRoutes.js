import express from "express";
import { login, getMe } from "../controllers/authController.js";
import { Auth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", Auth, getMe);

export default router;
