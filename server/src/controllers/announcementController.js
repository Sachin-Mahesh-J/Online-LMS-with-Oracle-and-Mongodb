import Announcement from "../models/Announcement.js";
import {
  validateInstructor,
  validateCourse,
  validateModule,
} from "../services/oracleValidationService.js";

export const createAnnouncement = async (req, res) => {
  try {
    const {
      instructor_id,
      course_id,
      module_id,
      title,
      message,
      target_group,
    } = req.body;

    if (!instructor_id || !course_id || !title || !message) {
      return res.status(400).json({
        message: "instructor_id, course_id, title, and message are required",
      });
    }

    const instructorExists = await validateInstructor(Number(instructor_id));
    if (!instructorExists) {
      return res.status(400).json({
        message: "Invalid instructor_id: instructor does not exist in Oracle",
      });
    }

    const courseExists = await validateCourse(Number(course_id));
    if (!courseExists) {
      return res.status(400).json({
        message: "Invalid course_id: course does not exist in Oracle",
      });
    }

    if (module_id !== null && module_id !== undefined) {
      const moduleExists = await validateModule(Number(module_id));
      if (!moduleExists) {
        return res.status(400).json({
          message: "Invalid module_id: module does not exist in Oracle",
        });
      }
    }

    const announcement = await Announcement.create({
      instructor_id: Number(instructor_id),
      course_id: Number(course_id),
      module_id:
        module_id !== null && module_id !== undefined
          ? Number(module_id)
          : null,
      title,
      message,
      target_group: target_group || "all_students",
    });

    res.status(201).json({
      message: "Announcement created successfully",
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create announcement",
      error: error.message,
    });
  }
};

export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ posted_at: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch announcements",
      error: error.message,
    });
  }
};

export const getAnnouncementsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const courseExists = await validateCourse(Number(courseId));
    if (!courseExists) {
      return res.status(400).json({
        message: "Invalid course_id: course does not exist in Oracle",
      });
    }

    const announcements = await Announcement.find({
      course_id: Number(courseId),
    }).sort({ posted_at: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch course announcements",
      error: error.message,
    });
  }
};

export const getAnnouncementsByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const moduleExists = await validateModule(Number(moduleId));
    if (!moduleExists) {
      return res.status(400).json({
        message: "Invalid module_id: module does not exist in Oracle",
      });
    }

    const announcements = await Announcement.find({
      module_id: Number(moduleId),
    }).sort({ posted_at: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch module announcements",
      error: error.message,
    });
  }
};
