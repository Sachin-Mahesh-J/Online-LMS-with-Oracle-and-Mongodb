import CourseReview from "../models/CourseReview.js";
import {
  validateStudent,
  validateCourse,
} from "../services/oracleValidationService.js";

export const createReview = async (req, res) => {
  try {
    const { student_id, course_id, rating, review_text } = req.body;

    if (!student_id || !course_id || rating === undefined) {
      return res.status(400).json({
        message: "student_id, course_id, and rating are required",
      });
    }

    const numericStudentId = Number(student_id);
    const numericCourseId = Number(course_id);
    const numericRating = Number(rating);

    const studentExists = await validateStudent(numericStudentId);
    if (!studentExists) {
      return res.status(400).json({
        message: "Invalid student_id: student does not exist in Oracle",
      });
    }

    const courseExists = await validateCourse(numericCourseId);
    if (!courseExists) {
      return res.status(400).json({
        message: "Invalid course_id: course does not exist in Oracle",
      });
    }

    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        message: "rating must be between 1 and 5",
      });
    }

    const existingReview = await CourseReview.findOne({
      student_id: numericStudentId,
      course_id: numericCourseId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "This student has already reviewed this course",
      });
    }

    const review = await CourseReview.create({
      student_id: numericStudentId,
      course_id: numericCourseId,
      rating: numericRating,
      review_text: review_text || "",
    });

    res.status(201).json({
      message: "Course review created successfully",
      data: review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "This student has already reviewed this course",
      });
    }

    res.status(500).json({
      message: "Failed to create course review",
      error: error.message,
    });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await CourseReview.find().sort({ created_at: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

export const getReviewsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const numericCourseId = Number(courseId);

    const courseExists = await validateCourse(numericCourseId);
    if (!courseExists) {
      return res.status(400).json({
        message: "Invalid course_id: course does not exist in Oracle",
      });
    }

    const reviews = await CourseReview.find({
      course_id: numericCourseId,
    }).sort({ created_at: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch course reviews",
      error: error.message,
    });
  }
};

export const getReviewsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const numericStudentId = Number(studentId);

    const studentExists = await validateStudent(numericStudentId);
    if (!studentExists) {
      return res.status(400).json({
        message: "Invalid student_id: student does not exist in Oracle",
      });
    }

    const reviews = await CourseReview.find({
      student_id: numericStudentId,
    }).sort({ created_at: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student reviews",
      error: error.message,
    });
  }
};
