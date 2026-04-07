import mongoose from "mongoose";

const mongoUri =
  "mongodb+srv://sachinjayathilaka884_db_user:syDMKC0rmOumGInN@cluster0.b4hlkk1.mongodb.net/lms_mongo?retryWrites=true&w=majority&appName=Cluster0";

const forumPostSchema = new mongoose.Schema(
  {
    student_id: Number,
    course_id: Number,
    module_id: Number,
    title: String,
    content: String,
    tags: [String],
    created_at: Date,
    edited_at: { type: Date, default: null },
    replies: [
      {
        student_id: Number,
        content: String,
        created_at: Date,
        _id: false,
      },
    ],
  },
  { collection: "forum_posts" },
);
forumPostSchema.index({ course_id: 1, module_id: 1, created_at: -1 });

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    student_id: Number,
    course_id: Number,
    module_id: Number,
    submission_title: String,
    file_name: String,
    file_type: String,
    file_size: Number,
    submitted_at: Date,
    status: {
      type: String,
      enum: ["submitted", "late", "resubmitted", "graded"],
    },
    remarks: String,
  },
  { collection: "assignment_submissions" },
);
assignmentSubmissionSchema.index({ student_id: 1, course_id: 1, module_id: 1 });
assignmentSubmissionSchema.index({
  course_id: 1,
  module_id: 1,
  submitted_at: -1,
});

const announcementSchema = new mongoose.Schema(
  {
    instructor_id: Number,
    course_id: Number,
    module_id: { type: Number, default: null },
    title: String,
    message: String,
    target_group: {
      type: String,
      enum: ["all_students", "course_students", "module_students"],
    },
    posted_at: Date,
  },
  { collection: "announcements" },
);
announcementSchema.index({ course_id: 1, posted_at: -1 });
announcementSchema.index({ module_id: 1, posted_at: -1 });

const courseReviewSchema = new mongoose.Schema(
  {
    student_id: Number,
    course_id: Number,
    rating: Number,
    review_text: String,
    created_at: Date,
  },
  { collection: "course_reviews" },
);
courseReviewSchema.index({ course_id: 1, rating: -1 });
courseReviewSchema.index({ student_id: 1, course_id: 1 }, { unique: true });

const ForumPost = mongoose.model("ForumPost", forumPostSchema);
const AssignmentSubmission = mongoose.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema,
);
const Announcement = mongoose.model("Announcement", announcementSchema);
const CourseReview = mongoose.model("CourseReview", courseReviewSchema);

async function run() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;

  const existing = await db.listCollections().toArray();
  const names = new Set(existing.map((c) => c.name));
  for (const name of [
    "forum_posts",
    "assignment_submissions",
    "announcements",
    "course_reviews",
  ]) {
    if (names.has(name)) {
      await db.dropCollection(name);
    }
  }

  await ForumPost.createCollection();
  await AssignmentSubmission.createCollection();
  await Announcement.createCollection();
  await CourseReview.createCollection();

  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  await ForumPost.insertMany([
    {
      student_id: 1,
      course_id: 1,
      module_id: 1,
      title: "Need help with cleaning survey data",
      content:
        "What is a simple way to handle missing values before plotting trends?",
      tags: ["python", "data-cleaning", "beginner"],
      created_at: new Date(now.getTime() - 8 * day),
      edited_at: null,
      replies: [
        {
          student_id: 2,
          content: "Start with checking null counts column by column.",
          created_at: new Date(now.getTime() - 7 * day),
        },
        {
          student_id: 3,
          content:
            "Also decide whether to fill or remove based on the field meaning.",
          created_at: new Date(now.getTime() - 7 * day + 3600000),
        },
      ],
    },
    {
      student_id: 2,
      course_id: 2,
      module_id: 3,
      title: "Express route structure question",
      content:
        "Should controller validation stay in the route file or the controller file for a small LMS project?",
      tags: ["express", "backend", "architecture"],
      created_at: new Date(now.getTime() - 6 * day),
      edited_at: null,
      replies: [
        {
          student_id: 5,
          content:
            "Keep routes thin and place validation logic in controllers or middleware.",
          created_at: new Date(now.getTime() - 5 * day),
        },
      ],
    },
    {
      student_id: 4,
      course_id: 4,
      module_id: 7,
      title: "Authentication vs authorization",
      content: "Can someone explain the difference with a real LMS example?",
      tags: ["security", "auth"],
      created_at: new Date(now.getTime() - 4 * day),
      edited_at: null,
      replies: [],
    },
  ]);

  await AssignmentSubmission.insertMany([
    {
      student_id: 1,
      course_id: 1,
      module_id: 2,
      submission_title: "Data cleaning exercise",
      file_name: "john_silva_cleaning_report.pdf",
      file_type: "pdf",
      file_size: 524288,
      submitted_at: new Date(now.getTime() - 3 * day),
      status: "graded",
      remarks: "Good handling of null values and outliers.",
    },
    {
      student_id: 2,
      course_id: 2,
      module_id: 4,
      submission_title: "Mongoose CRUD task",
      file_name: "ishara_mongoose_task.zip",
      file_type: "zip",
      file_size: 1048576,
      submitted_at: new Date(now.getTime() - 2 * day),
      status: "submitted",
      remarks: "Awaiting review.",
    },
    {
      student_id: 3,
      course_id: 3,
      module_id: 6,
      submission_title: "AWS deployment reflection",
      file_name: "kamal_aws_reflection.docx",
      file_type: "docx",
      file_size: 262144,
      submitted_at: new Date(now.getTime() - day),
      status: "resubmitted",
      remarks: "Updated with deployment screenshots.",
    },
  ]);

  await Announcement.insertMany([
    {
      instructor_id: 1,
      course_id: 1,
      module_id: 2,
      title: "Notebook submission reminder",
      message:
        "Please upload your cleaned dataset notebook before Friday night.",
      target_group: "module_students",
      posted_at: new Date(now.getTime() - 5 * day),
    },
    {
      instructor_id: 2,
      course_id: 2,
      module_id: null,
      title: "API demo session",
      message:
        "This week we will review controller structure and API testing in class.",
      target_group: "course_students",
      posted_at: new Date(now.getTime() - 3 * day),
    },
    {
      instructor_id: 4,
      course_id: 4,
      module_id: 7,
      title: "Security quiz update",
      message:
        "The quiz opens tomorrow and covers threats, actors, and basic controls.",
      target_group: "module_students",
      posted_at: new Date(now.getTime() - day),
    },
  ]);

  await CourseReview.insertMany([
    {
      student_id: 1,
      course_id: 1,
      rating: 5,
      review_text: "Very clear introduction to practical data analysis work.",
      created_at: new Date(now.getTime() - 10 * day),
    },
    {
      student_id: 3,
      course_id: 3,
      rating: 4,
      review_text:
        "Good cloud basics with helpful examples and manageable pacing.",
      created_at: new Date(now.getTime() - 9 * day),
    },
    {
      student_id: 4,
      course_id: 4,
      rating: 5,
      review_text:
        "Useful real-world examples for authentication and access control topics.",
      created_at: new Date(now.getTime() - 2 * day),
    },
  ]);

  console.log("MongoDB reset and seed complete.");
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("MongoDB reset/seed failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
