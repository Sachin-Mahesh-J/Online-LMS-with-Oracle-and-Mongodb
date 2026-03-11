import express from "express";
import {
  createForumPost,
  getAllForumPosts,
  getForumPostsByCourse,
  addReplyToPost,
  getRepliesByPost,
} from "../controllers/forumController.js";
import {
  Auth,
  requireStudent,
  requireAnyUser,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", Auth, requireStudent, createForumPost);
router.get("/", Auth, requireAnyUser, getAllForumPosts);
router.get("/course/:courseId", Auth, requireAnyUser, getForumPostsByCourse);

router.post("/:postId/replies", Auth, requireStudent, addReplyToPost);
router.get("/:postId/replies", Auth, requireAnyUser, getRepliesByPost);

export default router;
