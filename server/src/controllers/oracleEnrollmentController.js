import oracledb from "oracledb";
import getOracleConnection from "../config/oracle.js";

export const getAllEnrollments = async (req, res) => {
  let connection;

  try {
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        enrollment_id,
        student_id,
        course_id,
        enrollment_date,
        completion_status,
        progress_percent
      FROM enrollments
      ORDER BY enrollment_id
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({
      message: "Failed to fetch enrollments",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const getEnrollmentById = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        enrollment_id,
        student_id,
        course_id,
        enrollment_date,
        completion_status,
        progress_percent
      FROM enrollments
      WHERE enrollment_id = :id
      `,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    res.status(500).json({
      message: "Failed to fetch enrollment",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const getEnrollmentsByStudentId = async (req, res) => {
  let connection;

  try {
    const { studentId } = req.params;
    const numericStudentId = Number(studentId);

    if (
      req.user?.role === "STUDENT" &&
      Number(req.user.student_id) !== numericStudentId
    ) {
      return res.status(403).json({
        message: "You can only view your own enrollments",
      });
    }

    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        enrollment_id,
        student_id,
        course_id,
        enrollment_date,
        completion_status,
        progress_percent
      FROM enrollments
      WHERE student_id = :studentId
      ORDER BY enrollment_date DESC, enrollment_id DESC
      `,
      { studentId: numericStudentId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching student enrollments:", error);
    res.status(500).json({
      message: "Failed to fetch enrollments for student",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const getEnrollmentsByCourseId = async (req, res) => {
  let connection;

  try {
    const { courseId } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        enrollment_id,
        student_id,
        course_id,
        enrollment_date,
        completion_status,
        progress_percent
      FROM enrollments
      WHERE course_id = :courseId
      ORDER BY enrollment_date DESC, enrollment_id DESC
      `,
      { courseId: Number(courseId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching course enrollments:", error);
    res.status(500).json({
      message: "Failed to fetch enrollments for course",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const createEnrollment = async (req, res) => {
  let connection;

  try {
    const { student_id, course_id } = req.body;

    if (
      req.user?.role === "STUDENT" &&
      Number(req.user.student_id) !== Number(student_id)
    ) {
      return res.status(403).json({
        message: "You can only create enrollments for yourself",
      });
    }

    if (!student_id || !course_id) {
      return res.status(400).json({
        message: "student_id and course_id are required",
      });
    }

    connection = await getOracleConnection();

    await connection.execute(
      `
      BEGIN
        enroll_student(:student_id, :course_id);
      END;
      `,
      {
        student_id: Number(student_id),
        course_id: Number(course_id),
      },
      { autoCommit: true },
    );

    const inserted = await connection.execute(
      `
      SELECT
        enrollment_id,
        student_id,
        course_id,
        enrollment_date,
        completion_status,
        progress_percent
      FROM enrollments
      WHERE student_id = :student_id
        AND course_id = :course_id
      `,
      {
        student_id: Number(student_id),
        course_id: Number(course_id),
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    res.status(201).json({
      message: "Enrollment created successfully",
      enrollment: inserted.rows[0],
    });
  } catch (error) {
    console.error("Error creating enrollment:", error);

    if (error.message.includes("ORA-20001")) {
      return res.status(400).json({
        message: "Student does not exist",
      });
    }

    if (error.message.includes("ORA-20002")) {
      return res.status(400).json({
        message: "Course does not exist",
      });
    }

    if (error.message.includes("ORA-20003")) {
      return res.status(400).json({
        message: "Student is already enrolled in this course",
      });
    }

    res.status(500).json({
      message: "Failed to create enrollment",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const updateEnrollment = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    const { completion_status, progress_percent } = req.body;

    if (completion_status === undefined && progress_percent === undefined) {
      return res.status(400).json({
        message: "Provide completion_status and/or progress_percent",
      });
    }

    if (
      completion_status !== undefined &&
      !["ENROLLED", "IN_PROGRESS", "COMPLETED", "DROPPED"].includes(
        completion_status,
      )
    ) {
      return res.status(400).json({
        message:
          "completion_status must be ENROLLED, IN_PROGRESS, COMPLETED, or DROPPED",
      });
    }

    if (
      progress_percent !== undefined &&
      (Number(progress_percent) < 0 || Number(progress_percent) > 100)
    ) {
      return res.status(400).json({
        message: "progress_percent must be between 0 and 100",
      });
    }

    connection = await getOracleConnection();

    const current = await connection.execute(
      `
      SELECT
        enrollment_id,
        completion_status,
        progress_percent
      FROM enrollments
      WHERE enrollment_id = :id
      `,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (current.rows.length === 0) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const existing = current.rows[0];

    await connection.execute(
      `
      UPDATE enrollments
      SET completion_status = :completion_status,
          progress_percent = :progress_percent
      WHERE enrollment_id = :id
      `,
      {
        id: Number(id),
        completion_status:
          completion_status !== undefined
            ? completion_status
            : existing.COMPLETION_STATUS,
        progress_percent:
          progress_percent !== undefined
            ? Number(progress_percent)
            : existing.PROGRESS_PERCENT,
      },
      { autoCommit: true },
    );

    const updated = await connection.execute(
      `
      SELECT
        enrollment_id,
        student_id,
        course_id,
        enrollment_date,
        completion_status,
        progress_percent
      FROM enrollments
      WHERE enrollment_id = :id
      `,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    res.status(200).json({
      message: "Enrollment updated successfully",
      enrollment: updated.rows[0],
    });
  } catch (error) {
    console.error("Error updating enrollment:", error);
    res.status(500).json({
      message: "Failed to update enrollment",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};
