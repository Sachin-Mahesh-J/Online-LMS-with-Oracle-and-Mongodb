import ForumPost from "../models/ForumPost.js";
import {
  validateStudent,
  validateCourse,
  validateModule,
} from "../services/oracleValidationService.js";

export const createForumPost = async (req, res) => {
  try {
    const { course_id, module_id, title, content, tags } = req.body;
    const student_id = req.user.student_id;

    if (!student_id || !course_id || !module_id || !title || !content) {
      return res.status(400).json({
        message: "course_id, module_id, title, and content are required",
      });
    }

    const studentExists = await validateStudent(Number(student_id));
    if (!studentExists) {
      return res.status(400).json({
        message: "Invalid student_id: student does not exist in Oracle",
      });
    }

    const courseExists = await validateCourse(Number(course_id));
    if (!courseExists) {
      return res.status(400).json({
        message: "Invalid course_id: course does not exist in Oracle",
      });
    }

    const moduleExists = await validateModule(Number(module_id));
    if (!moduleExists) {
      return res.status(400).json({
        message: "Invalid module_id: module does not exist in Oracle",
      });
    }

    const newPost = await ForumPost.create({
      student_id: Number(student_id),
      course_id: Number(course_id),
      module_id: Number(module_id),
      title,
      content,
      tags: tags || [],
    });

    res.status(201).json({
      message: "Forum post created successfully",
      data: newPost,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create forum post",
      error: error.message,
    });
  }
};

export const getAllForumPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find().sort({ created_at: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch forum posts",
      error: error.message,
    });
  }
};

export const getForumPostsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const courseExists = await validateCourse(Number(courseId));
    if (!courseExists) {
      return res.status(400).json({
        message: "Invalid course_id: course does not exist in Oracle",
      });
    }

    const posts = await ForumPost.find({
      course_id: Number(courseId),
    }).sort({ created_at: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch course forum posts",
      error: error.message,
    });
  }
};

export const addReplyToPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const student_id = req.user.student_id;

    if (!student_id || !content) {
      return res.status(400).json({
        message: "content is required",
      });
    }

    const studentExists = await validateStudent(Number(student_id));
    if (!studentExists) {
      return res.status(400).json({
        message: "Invalid student_id: student does not exist in Oracle",
      });
    }

    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Forum post not found",
      });
    }

    post.replies.push({
      student_id: Number(student_id),
      content,
    });

    await post.save();

    res.status(201).json({
      message: "Reply added successfully",
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add reply",
      error: error.message,
    });
  }
};

export const getRepliesByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await ForumPost.findById(postId).select("replies title");
    if (!post) {
      return res.status(404).json({
        message: "Forum post not found",
      });
    }

    res.status(200).json({
      post_id: post._id,
      title: post.title,
      replies: post.replies,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch replies",
      error: error.message,
    });
  }
};
