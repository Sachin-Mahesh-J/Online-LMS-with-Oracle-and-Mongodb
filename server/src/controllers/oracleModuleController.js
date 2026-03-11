import oracledb from "oracledb";
import getOracleConnection from "../config/oracle.js";
import { validateCourse } from "../services/oracleValidationService.js";

export const getAllModules = async (req, res) => {
  let connection;

  try {
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        module_id,
        course_id,
        module_title,
        module_description,
        module_order,
        duration_hours
      FROM modules
      ORDER BY course_id, module_order, module_id
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({
      message: "Failed to fetch modules",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const getModuleById = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        module_id,
        course_id,
        module_title,
        module_description,
        module_order,
        duration_hours
      FROM modules
      WHERE module_id = :id
      `,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Module not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching module:", error);
    res.status(500).json({
      message: "Failed to fetch module",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const getModulesByCourseId = async (req, res) => {
  let connection;

  try {
    const { courseId } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        module_id,
        course_id,
        module_title,
        module_description,
        module_order,
        duration_hours
      FROM modules
      WHERE course_id = :courseId
      ORDER BY module_order, module_id
      `,
      { courseId: Number(courseId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching course modules:", error);
    res.status(500).json({
      message: "Failed to fetch modules for course",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const createModule = async (req, res) => {
  let connection;

  try {
    const {
      course_id,
      module_title,
      module_description,
      module_order,
      duration_hours,
    } = req.body;

    if (!course_id || !module_title || module_order === undefined) {
      return res.status(400).json({
        message: "course_id, module_title, and module_order are required",
      });
    }

    const courseExists = await validateCourse(course_id);
    if (!courseExists) {
      return res.status(400).json({
        message: "Invalid course_id: course does not exist in Oracle",
      });
    }

    if (Number(module_order) < 1) {
      return res.status(400).json({
        message: "module_order must be 1 or greater",
      });
    }

    if (duration_hours !== undefined && Number(duration_hours) < 0) {
      return res.status(400).json({
        message: "duration_hours must be 0 or greater",
      });
    }

    connection = await getOracleConnection();

    const duplicateCheck = await connection.execute(
      `
      SELECT module_id
      FROM modules
      WHERE course_id = :course_id
      AND module_order = :module_order
      `,
      {
        course_id: Number(course_id),
        module_order: Number(module_order),
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        message:
          "A module with this module_order already exists for the course",
      });
    }

    const result = await connection.execute(
      `
      INSERT INTO modules (
        course_id,
        module_title,
        module_description,
        module_order,
        duration_hours
      ) VALUES (
        :course_id,
        :module_title,
        :module_description,
        :module_order,
        :duration_hours
      )
      RETURNING module_id INTO :new_id
      `,
      {
        course_id: Number(course_id),
        module_title,
        module_description: module_description || null,
        module_order: Number(module_order),
        duration_hours:
          duration_hours !== undefined ? Number(duration_hours) : null,
        new_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: true },
    );

    res.status(201).json({
      message: "Module created successfully",
      module_id: result.outBinds.new_id[0],
    });
  } catch (error) {
    console.error("Error creating module:", error);
    res.status(500).json({
      message: "Failed to create module",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};
