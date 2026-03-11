import mongoose from "mongoose";

const courseReviewSchema = new mongoose.Schema(
  {
    student_id: {
      type: Number,
      required: true,
    },
    course_id: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review_text: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "course_reviews",
  },
);

courseReviewSchema.index({ course_id: 1, rating: -1 });
courseReviewSchema.index({ student_id: 1, course_id: 1 }, { unique: true });

const CourseReview = mongoose.model("CourseReview", courseReviewSchema);

export default CourseReview;
