import oracledb from "oracledb";
import getOracleConnection from "../config/oracle.js";

export const getAllInstructors = async (req, res) => {
  let connection;

  try {
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        instructor_id,
        first_name,
        last_name,
        email,
        phone,
        specialization,
        hired_date,
        status
      FROM instructors
      ORDER BY instructor_id
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({
      message: "Failed to fetch instructors",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const getInstructorById = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        instructor_id,
        first_name,
        last_name,
        email,
        phone,
        specialization,
        hired_date,
        status
      FROM instructors
      WHERE instructor_id = :id
      `,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching instructor:", error);
    res.status(500).json({
      message: "Failed to fetch instructor",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const createInstructor = async (req, res) => {
  let connection;

  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      specialization,
      hired_date,
      status,
    } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        message: "first_name, last_name, and email are required",
      });
    }

    const finalStatus = status || "ACTIVE";

    if (!["ACTIVE", "INACTIVE"].includes(finalStatus)) {
      return res.status(400).json({
        message: "status must be ACTIVE or INACTIVE",
      });
    }

    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      INSERT INTO instructors (
        first_name,
        last_name,
        email,
        phone,
        specialization,
        hired_date,
        status
      ) VALUES (
        :first_name,
        :last_name,
        :email,
        :phone,
        :specialization,
        :hired_date,
        :status
      )
      RETURNING instructor_id INTO :new_id
      `,
      {
        first_name,
        last_name,
        email,
        phone: phone || null,
        specialization: specialization || null,
        hired_date: hired_date ? new Date(hired_date) : null,
        status: finalStatus,
        new_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: true },
    );

    res.status(201).json({
      message: "Instructor created successfully",
      instructor_id: result.outBinds.new_id[0],
    });
  } catch (error) {
    console.error("Error creating instructor:", error);

    if (error.message.includes("ORA-00001")) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create instructor",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};
