import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    student_id: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const forumPostSchema = new mongoose.Schema(
  {
    student_id: {
      type: Number,
      required: true,
    },
    course_id: {
      type: Number,
      required: true,
    },
    module_id: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) => tags.map((tag) => tag.trim()),
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    edited_at: {
      type: Date,
      default: null,
    },
    replies: {
      type: [replySchema],
      default: [],
    },
  },
  {
    collection: "forum_posts",
  },
);

forumPostSchema.index({ course_id: 1, module_id: 1, created_at: -1 });

const ForumPost = mongoose.model("ForumPost", forumPostSchema);

export default ForumPost;
