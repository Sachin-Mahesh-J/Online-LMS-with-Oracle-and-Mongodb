import oracledb from "oracledb";
import getOracleConnection from "../config/oracle.js";

export const getAllStudents = async (req, res) => {
  let connection;

  try {
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        student_id,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        registered_at,
        status
      FROM students
      ORDER BY student_id
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const getStudentById = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        student_id,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        registered_at,
        status
      FROM students
      WHERE student_id = :id
      `,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({
      message: "Failed to fetch student",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const createStudent = async (req, res) => {
  let connection;

  try {
    const { first_name, last_name, email, phone, date_of_birth, status } =
      req.body;

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
      INSERT INTO students (
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        status
      ) VALUES (
        :first_name,
        :last_name,
        :email,
        :phone,
        :date_of_birth,
        :status
      )
      RETURNING student_id INTO :new_id
      `,
      {
        first_name,
        last_name,
        email,
        phone: phone || null,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
        status: finalStatus,
        new_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: true },
    );

    res.status(201).json({
      message: "Student created successfully",
      student_id: result.outBinds.new_id[0],
    });
  } catch (error) {
    console.error("Error creating student:", error);

    if (error.message.includes("ORA-00001")) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create student",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};
