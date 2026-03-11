import AssignmentSubmission from "../models/AssignmentSubmission.js";
import {
  validateStudent,
  validateCourse,
  validateModule,
} from "../services/oracleValidationService.js";

export const createSubmission = async (req, res) => {
  try {
    const {
      student_id,
      course_id,
      module_id,
      submission_title,
      file_name,
      file_type,
      file_size,
      status,
      remarks,
    } = req.body;

    if (
      !student_id ||
      !course_id ||
      !module_id ||
      !submission_title ||
      !file_name ||
      !file_type ||
      file_size === undefined
    ) {
      return res.status(400).json({
        message:
          "student_id, course_id, module_id, submission_title, file_name, file_type, and file_size are required",
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

    if (Number(file_size) <= 0) {
      return res.status(400).json({
        message: "file_size must be greater than 0",
      });
    }

    const submission = await AssignmentSubmission.create({
      student_id: Number(student_id),
      course_id: Number(course_id),
      module_id: Number(module_id),
      submission_title,
      file_name,
      file_type: file_type.toLowerCase(),
      file_size: Number(file_size),
      status: status || "submitted",
      remarks: remarks || "",
    });

    res.status(201).json({
      message: "Assignment submission created successfully",
      data: submission,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create assignment submission",
      error: error.message,
    });
  }
};

export const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find().sort({
      submitted_at: -1,
    });

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
};

export const getSubmissionsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const studentExists = await validateStudent(Number(studentId));
    if (!studentExists) {
      return res.status(400).json({
        message: "Invalid student_id: student does not exist in Oracle",
      });
    }

    const submissions = await AssignmentSubmission.find({
      student_id: Number(studentId),
    }).sort({ submitted_at: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student submissions",
      error: error.message,
    });
  }
};

export const getSubmissionsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const courseExists = await validateCourse(Number(courseId));
    if (!courseExists) {
      return res.status(400).json({
        message: "Invalid course_id: course does not exist in Oracle",
      });
    }

    const submissions = await AssignmentSubmission.find({
      course_id: Number(courseId),
    }).sort({ submitted_at: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch course submissions",
      error: error.message,
    });
  }
};
