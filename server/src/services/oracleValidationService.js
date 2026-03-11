import oracledb from "oracledb";
import getOracleConnection from "../config/oracle.js";

const checkExists = async (table, column, value, bindName) => {
  let connection;
  try {
    connection = await getOracleConnection();

    const result = await connection.execute(
      `SELECT COUNT(*) AS COUNT
       FROM ${table}
       WHERE ${column} = :${bindName}`,
      { [bindName]: value },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    return result.rows[0].COUNT > 0;
  } catch (error) {
    console.error(`Validation error in ${table}:`, error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
};

export const validateStudent = async (studentId) =>
  checkExists("students", "student_id", studentId, "studentId");

export const validateCourse = async (courseId) =>
  checkExists("courses", "course_id", courseId, "courseId");

export const validateModule = async (moduleId) =>
  checkExists("modules", "module_id", moduleId, "moduleId");

export const validateInstructor = async (instructorId) =>
  checkExists("instructors", "instructor_id", instructorId, "instructorId");
