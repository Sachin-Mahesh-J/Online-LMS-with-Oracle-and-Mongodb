import AssignmentSubmission from "../models/AssignmentSubmission.js";
import fs from "fs";
import path from "path";
import {
  validateStudent,
  validateCourse,
  validateModule,
} from "../services/oracleValidationService.js";

export const createSubmission = async (req, res) => {
  try {
    const {
      course_id,
      module_id,
      submission_title,
      file_name: bodyFileName,
      file_type: bodyFileType,
      file_size: bodyFileSize,
      status,
      remarks,
    } = req.body;

    const uploadedFile = req.file;
    const file_name = uploadedFile ? uploadedFile.originalname : bodyFileName;
    const file_size = uploadedFile ? uploadedFile.size : bodyFileSize;
    const file_type = uploadedFile
      ? path.extname(uploadedFile.originalname).slice(1) ||
        uploadedFile.mimetype ||
        ""
      : bodyFileType;

    const stored_file_name = uploadedFile ? uploadedFile.filename : "";
    const file_url = uploadedFile
      ? `/uploads/submissions/${uploadedFile.filename}`
      : "";

    const student_id = req.user.student_id;

    if (
      !student_id ||
      !course_id ||
      !module_id ||
      !submission_title ||
      !file_name ||
      !file_type ||
      file_size === undefined
    ) {
      if (uploadedFile?.path) {
        try {
          fs.unlinkSync(uploadedFile.path);
        } catch {
          // ignore cleanup errors
        }
      }
      return res.status(400).json({
        message:
          "course_id, module_id, submission_title, file_name, file_type, and file_size are required",
      });
    }

    const studentExists = await validateStudent(Number(student_id));
    if (!studentExists) {
      if (uploadedFile?.path) {
        try {
          fs.unlinkSync(uploadedFile.path);
        } catch {
          // ignore cleanup errors
        }
      }
      return res.status(400).json({
        message: "Invalid student_id: student does not exist in Oracle",
      });
    }

    const courseExists = await validateCourse(Number(course_id));
    if (!courseExists) {
      if (uploadedFile?.path) {
        try {
          fs.unlinkSync(uploadedFile.path);
        } catch {
          // ignore cleanup errors
        }
      }
      return res.status(400).json({
        message: "Invalid course_id: course does not exist in Oracle",
      });
    }

    const moduleExists = await validateModule(Number(module_id));
    if (!moduleExists) {
      if (uploadedFile?.path) {
        try {
          fs.unlinkSync(uploadedFile.path);
        } catch {
          // ignore cleanup errors
        }
      }
      return res.status(400).json({
        message: "Invalid module_id: module does not exist in Oracle",
      });
    }

    if (Number(file_size) <= 0) {
      if (uploadedFile?.path) {
        try {
          fs.unlinkSync(uploadedFile.path);
        } catch {
          // ignore cleanup errors
        }
      }
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
      stored_file_name,
      file_url,
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

export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await AssignmentSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    if (
      req.user.role === "STUDENT" &&
      req.user.student_id !== submission.student_id
    ) {
      return res.status(403).json({
        message: "You can only view your own submissions",
      });
    }

    return res.status(200).json(submission);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch submission",
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
    const numericStudentId = Number(studentId);

    const studentExists = await validateStudent(numericStudentId);
    if (!studentExists) {
      return res.status(400).json({
        message: "Invalid student_id: student does not exist in Oracle",
      });
    }

    if (
      req.user.role === "STUDENT" &&
      req.user.student_id !== numericStudentId
    ) {
      return res.status(403).json({
        message: "You can only view your own submissions",
      });
    }

    const submissions = await AssignmentSubmission.find({
      student_id: numericStudentId,
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
