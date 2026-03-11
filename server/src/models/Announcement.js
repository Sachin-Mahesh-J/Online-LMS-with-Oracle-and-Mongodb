import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    instructor_id: {
      type: Number,
      required: true,
    },
    course_id: {
      type: Number,
      required: true,
    },
    module_id: {
      type: Number,
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    target_group: {
      type: String,
      default: "all_students",
      trim: true,
      enum: ["all_students", "course_students", "module_students"],
    },
    posted_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "announcements",
  },
);

announcementSchema.index({ course_id: 1, posted_at: -1 });
announcementSchema.index({ module_id: 1, posted_at: -1 });

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
