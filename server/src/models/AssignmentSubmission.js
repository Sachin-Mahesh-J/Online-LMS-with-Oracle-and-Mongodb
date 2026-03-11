import mongoose from "mongoose";

const assignmentSubmissionSchema = new mongoose.Schema(
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
    submission_title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    file_name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    file_type: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 1,
    },
    file_size: {
      type: Number,
      required: true,
      min: 1,
    },
    stored_file_name: {
      type: String,
      default: "",
      trim: true,
    },
    file_url: {
      type: String,
      default: "",
      trim: true,
    },
    submitted_at: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: ["submitted", "late", "resubmitted", "graded"],
      default: "submitted",
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    collection: "assignment_submissions",
  },
);

assignmentSubmissionSchema.index({ student_id: 1, course_id: 1, module_id: 1 });
assignmentSubmissionSchema.index({
  course_id: 1,
  module_id: 1,
  submitted_at: -1,
});

const AssignmentSubmission = mongoose.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema,
);

export default AssignmentSubmission;
