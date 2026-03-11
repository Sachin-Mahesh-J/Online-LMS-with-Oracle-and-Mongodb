import express from "express";
import {
  createForumPost,
  getAllForumPosts,
  getForumPostsByCourse,
  addReplyToPost,
  getRepliesByPost,
} from "../controllers/forumController.js";

const router = express.Router();

router.post("/", createForumPost);
router.get("/", getAllForumPosts);
router.get("/course/:courseId", getForumPostsByCourse);

router.post("/:postId/replies", addReplyToPost);
router.get("/:postId/replies", getRepliesByPost);

export default router;
