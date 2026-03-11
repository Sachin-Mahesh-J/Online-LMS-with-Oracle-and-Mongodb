import oracledb from "oracledb";
import getOracleConnection from "../config/oracle.js";
import { validateInstructor } from "../services/oracleValidationService.js";

export const getAllCourses = async (req, res) => {
  let connection;

  try {
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        course_id,
        instructor_id,
        course_title,
        description,
        category,
        fee,
        duration_weeks,
        level_name,
        status
      FROM courses
      ORDER BY course_id
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      message: "Failed to fetch courses",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const getCourseById = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        course_id,
        instructor_id,
        course_title,
        description,
        category,
        fee,
        duration_weeks,
        level_name,
        status
      FROM courses
      WHERE course_id = :id
      `,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({
      message: "Failed to fetch course",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const createCourse = async (req, res) => {
  let connection;

  try {
    const {
      instructor_id,
      course_title,
      description,
      category,
      fee,
      duration_weeks,
      level_name,
      status,
    } = req.body;

    if (!instructor_id || !course_title) {
      return res.status(400).json({
        message: "instructor_id and course_title are required",
      });
    }

    const instructorExists = await validateInstructor(instructor_id);
    if (!instructorExists) {
      return res.status(400).json({
        message: "Invalid instructor_id: instructor does not exist in Oracle",
      });
    }

    const finalStatus = status || "ACTIVE";
    const finalFee = fee ?? 0;
    const finalLevel = level_name || null;

    if (!["ACTIVE", "INACTIVE"].includes(finalStatus)) {
      return res.status(400).json({
        message: "status must be ACTIVE or INACTIVE",
      });
    }

    if (
      finalLevel &&
      !["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(finalLevel)
    ) {
      return res.status(400).json({
        message: "level_name must be BEGINNER, INTERMEDIATE, or ADVANCED",
      });
    }

    if (Number(finalFee) < 0) {
      return res.status(400).json({
        message: "fee must be 0 or greater",
      });
    }

    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      INSERT INTO courses (
        instructor_id,
        course_title,
        description,
        category,
        fee,
        duration_weeks,
        level_name,
        status
      ) VALUES (
        :instructor_id,
        :course_title,
        :description,
        :category,
        :fee,
        :duration_weeks,
        :level_name,
        :status
      )
      RETURNING course_id INTO :new_id
      `,
      {
        instructor_id: Number(instructor_id),
        course_title,
        description: description || null,
        category: category || null,
        fee: Number(finalFee),
        duration_weeks: duration_weeks ? Number(duration_weeks) : null,
        level_name: finalLevel,
        status: finalStatus,
        new_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: true },
    );

    res.status(201).json({
      message: "Course created successfully",
      course_id: result.outBinds.new_id[0],
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({
      message: "Failed to create course",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};
