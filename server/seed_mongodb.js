import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb+srv://sachinjayathilaka884_db_user:syDMKC0rmOumGInN@cluster0.b4hlkk1.mongodb.net/lms_mongo?retryWrites=true&w=majority&appName=Cluster0";

const forumPosts = [
  {
    student_id: 1,
    course_id: 1,
    module_id: 2,
    title: "Need help understanding 2NF vs 3NF",
    content:
      "I understand removing repeating groups, but I still get confused when deciding whether a dependency is partial or transitive. Does anyone have a simple way to check it?",
    tags: ["normalization", "database-design", "help"],
    created_at: new Date("2025-10-14T09:30:00Z"),
    edited_at: null,
    replies: [
      {
        student_id: 6,
        content:
          "A good shortcut is to first identify the candidate key. If a non-key attribute depends on only part of a composite key, that is 2NF trouble. If it depends on another non-key attribute, that is 3NF trouble.",
        created_at: new Date("2025-10-14T10:05:00Z"),
      },
      {
        student_id: 12,
        content:
          "Try making tiny examples with order_id and product_id. It clicked for me once I drew the functional dependencies.",
        created_at: new Date("2025-10-14T11:10:00Z"),
      },
    ],
  },
  {
    student_id: 5,
    course_id: 2,
    module_id: 4,
    title: "Express route structure for larger projects",
    content:
      "For the bootcamp project, are you separating routes, controllers, and services from the start or only after the API grows?",
    tags: ["express", "architecture", "backend"],
    created_at: new Date("2025-10-16T08:15:00Z"),
    edited_at: null,
    replies: [
      {
        student_id: 2,
        content:
          "I split them early. It feels like more files at first, but validation and testing get much easier.",
        created_at: new Date("2025-10-16T09:01:00Z"),
      },
    ],
  },
  {
    student_id: 3,
    course_id: 3,
    module_id: 8,
    title: "Best dataset size for the cleaning assignment?",
    content:
      "I found a public sales dataset with around 12k rows. Is that enough to show meaningful cleaning steps and visual analysis?",
    tags: ["python", "datasets", "assignment"],
    created_at: new Date("2025-10-18T07:40:00Z"),
    edited_at: null,
    replies: [],
  },
  {
    student_id: 7,
    course_id: 4,
    module_id: 11,
    title: "Difference between IAM users and roles",
    content:
      "I know both are for permissions, but when would you create a role instead of assigning policies directly to a user?",
    tags: ["aws", "iam", "cloud"],
    created_at: new Date("2025-10-19T12:20:00Z"),
    edited_at: null,
    replies: [
      {
        student_id: 3,
        content:
          "Roles are great for temporary access and services. Users are better for long-term identities.",
        created_at: new Date("2025-10-19T13:02:00Z"),
      },
    ],
  },
  {
    student_id: 8,
    course_id: 6,
    module_id: 17,
    title: "Low-fidelity or high-fidelity prototype first?",
    content:
      "Our group keeps polishing visuals too early. Should we stay in low fidelity longer before moving to Figma details?",
    tags: ["ux", "prototyping", "teamwork"],
    created_at: new Date("2025-10-20T15:45:00Z"),
    edited_at: null,
    replies: [
      {
        student_id: 4,
        content:
          "Stay low fidelity until the flow is stable. Otherwise you spend time polishing screens that might be removed.",
        created_at: new Date("2025-10-20T16:05:00Z"),
      },
    ],
  },
  {
    student_id: 9,
    course_id: 7,
    module_id: 20,
    title: "PL SQL exception handling patterns",
    content:
      "Do you usually catch NO_DATA_FOUND separately and let everything else fall through to a generic handler, or do you define custom exceptions for most business rules?",
    tags: ["plsql", "exceptions", "oracle"],
    created_at: new Date("2025-10-22T06:55:00Z"),
    edited_at: null,
    replies: [
      {
        student_id: 1,
        content:
          "For business rules I like raise_application_error with specific codes. It makes the API layer much cleaner.",
        created_at: new Date("2025-10-22T07:20:00Z"),
      },
    ],
  },
];

const announcements = [
  {
    instructor_id: 6,
    course_id: 1,
    module_id: 2,
    title: "Normalization workshop this Friday",
    message:
      "We will run an extra live workshop on normalization problems this Friday at 6.30 PM. Please review the sample dependency sheet before joining.",
    target_group: "module_students",
    posted_at: new Date("2025-10-13T08:00:00Z"),
  },
  {
    instructor_id: 2,
    course_id: 2,
    module_id: null,
    title: "Bootcamp mini project released",
    message:
      "The mini project brief is now available. Build a REST API with at least three resources and submit your repository link by next week.",
    target_group: "course_students",
    posted_at: new Date("2025-10-15T09:00:00Z"),
  },
  {
    instructor_id: 1,
    course_id: 3,
    module_id: 8,
    title: "Dataset approval reminder",
    message:
      "Before starting the cleaning assignment, post your chosen dataset in the forum so we can confirm it is appropriate.",
    target_group: "module_students",
    posted_at: new Date("2025-10-17T10:15:00Z"),
  },
  {
    instructor_id: 3,
    course_id: 4,
    module_id: null,
    title: "Cloud lab credentials have been emailed",
    message:
      "Your sandbox credentials were sent to your student email. Contact support if you cannot access the lab environment.",
    target_group: "course_students",
    posted_at: new Date("2025-10-18T07:30:00Z"),
  },
  {
    instructor_id: 5,
    course_id: 6,
    module_id: 17,
    title: "Prototype critique session",
    message:
      "Bring your low-fidelity and high-fidelity prototype versions. We will compare design decisions and feedback quality.",
    target_group: "module_students",
    posted_at: new Date("2025-10-20T11:20:00Z"),
  },
];

const submissions = [
  {
    student_id: 1,
    course_id: 1,
    module_id: 3,
    submission_title: "Normalization case study",
    file_name: "john_silva_normalization_case_study.pdf",
    file_type: "pdf",
    file_size: 842000,
    submitted_at: new Date("2025-10-12T05:40:00Z"),
    status: "graded",
    remarks: "Strong decomposition logic. Minor notation issues.",
  },
  {
    student_id: 2,
    course_id: 2,
    module_id: 4,
    submission_title: "Express API mini project",
    file_name: "ishara_express_api.zip",
    file_type: "zip",
    file_size: 5240000,
    submitted_at: new Date("2025-10-16T17:10:00Z"),
    status: "submitted",
    remarks: "",
  },
  {
    student_id: 3,
    course_id: 3,
    module_id: 8,
    submission_title: "Data cleaning notebook",
    file_name: "kamal_cleaning_notebook.ipynb",
    file_type: "ipynb",
    file_size: 1280000,
    submitted_at: new Date("2025-10-18T13:30:00Z"),
    status: "graded",
    remarks: "Very clean workflow and explanations.",
  },
  {
    student_id: 5,
    course_id: 2,
    module_id: 6,
    submission_title: "Frontend integration demo",
    file_name: "rashen_frontend_demo.zip",
    file_type: "zip",
    file_size: 6340000,
    submitted_at: new Date("2025-10-19T16:45:00Z"),
    status: "resubmitted",
    remarks: "Resubmitted after fixing broken API route names.",
  },
  {
    student_id: 7,
    course_id: 4,
    module_id: 12,
    submission_title: "Cloud deployment walkthrough",
    file_name: "hasitha_cloud_walkthrough.pdf",
    file_type: "pdf",
    file_size: 2100000,
    submitted_at: new Date("2025-10-21T08:25:00Z"),
    status: "graded",
    remarks: "Deployment steps are clear and reproducible.",
  },
  {
    student_id: 8,
    course_id: 6,
    module_id: 18,
    submission_title: "Usability testing report",
    file_name: "dinuki_usability_report.docx",
    file_type: "docx",
    file_size: 990000,
    submitted_at: new Date("2025-10-22T14:15:00Z"),
    status: "late",
    remarks: "Late submission accepted with penalty.",
  },
  {
    student_id: 9,
    course_id: 7,
    module_id: 20,
    submission_title: "PL SQL exception demo",
    file_name: "sahan_plsql_exceptions.sql",
    file_type: "sql",
    file_size: 24000,
    submitted_at: new Date("2025-10-23T06:10:00Z"),
    status: "submitted",
    remarks: "",
  },
];

const reviews = [
  {
    student_id: 1,
    course_id: 1,
    rating: 5,
    review_text:
      "Very clear explanations and the assignments felt practical instead of repetitive.",
    created_at: new Date("2025-07-02T09:00:00Z"),
  },
  {
    student_id: 3,
    course_id: 3,
    rating: 4,
    review_text:
      "Good balance between Python basics and real analytics tasks. I wanted a bit more dashboard practice.",
    created_at: new Date("2025-07-22T10:30:00Z"),
  },
  {
    student_id: 5,
    course_id: 2,
    rating: 5,
    review_text:
      "The project-based style kept me engaged and helped me connect backend and frontend concepts well.",
    created_at: new Date("2025-08-28T07:45:00Z"),
  },
  {
    student_id: 7,
    course_id: 4,
    rating: 4,
    review_text:
      "Solid introduction to cloud services and deployment. Labs were the best part.",
    created_at: new Date("2025-09-18T13:20:00Z"),
  },
  {
    student_id: 8,
    course_id: 6,
    rating: 5,
    review_text:
      "Excellent examples and critique sessions. It felt close to a real product design workflow.",
    created_at: new Date("2025-10-05T12:10:00Z"),
  },
  {
    student_id: 9,
    course_id: 7,
    rating: 5,
    review_text:
      "One of the strongest technical courses in the platform. The PL SQL coverage was especially useful.",
    created_at: new Date("2025-10-07T08:50:00Z"),
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  await db.collection("forum_posts").deleteMany({});
  await db.collection("announcements").deleteMany({});
  await db.collection("assignment_submissions").deleteMany({});
  await db.collection("course_reviews").deleteMany({});

  await db.collection("forum_posts").insertMany(forumPosts);
  await db.collection("announcements").insertMany(announcements);
  await db.collection("assignment_submissions").insertMany(submissions);
  await db.collection("course_reviews").insertMany(reviews);

  console.log("MongoDB seed complete");
  console.log({
    forum_posts: forumPosts.length,
    announcements: announcements.length,
    assignment_submissions: submissions.length,
    course_reviews: reviews.length,
  });

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("MongoDB seeding failed:", error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
