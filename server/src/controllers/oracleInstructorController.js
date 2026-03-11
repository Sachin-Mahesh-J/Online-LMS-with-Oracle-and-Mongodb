import bcrypt from "bcrypt";
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

const parseId = (id) => {
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
};

export const getInstructorById = async (req, res) => {
  let connection;

  try {
    const parsedId = parseId(req.params.id);
    if (parsedId === null) {
      return res.status(400).json({ message: "Invalid instructor id" });
    }
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
      { id: parsedId },
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
    const raw = req.body;
    const first_name = typeof raw?.first_name === "string" ? raw.first_name.trim() : "";
    const last_name = typeof raw?.last_name === "string" ? raw.last_name.trim() : "";
    const email = typeof raw?.email === "string" ? raw.email.trim() : "";
    const password = typeof raw?.password === "string" ? raw.password : "";
    const { phone, specialization, hired_date, status } = raw || {};

    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        message: "first_name, last_name, and email are required",
      });
    }

    if (!password || password.length === 0) {
      return res.status(400).json({
        message: "Temporary password is required for login account creation",
      });
    }

    if (first_name.length > 50 || last_name.length > 50) {
      return res.status(400).json({ message: "first_name and last_name must be at most 50 characters" });
    }
    if (email.length > 100) {
      return res.status(400).json({ message: "email must be at most 100 characters" });
    }
    if (phone && String(phone).length > 20) {
      return res.status(400).json({ message: "phone must be at most 20 characters" });
    }
    if (specialization && String(specialization).length > 100) {
      return res.status(400).json({ message: "specialization must be at most 100 characters" });
    }

    let parsedHiredDate = null;
    if (hired_date) {
      parsedHiredDate = new Date(hired_date);
      if (Number.isNaN(parsedHiredDate.getTime())) {
        return res.status(400).json({ message: "hired_date must be a valid date" });
      }
    }

    const finalStatus = status || "ACTIVE";

    if (!["ACTIVE", "INACTIVE"].includes(finalStatus)) {
      return res.status(400).json({
        message: "status must be ACTIVE or INACTIVE",
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    connection = await getOracleConnection();

    let instructor_id;
    try {
      // Use transaction - create instructor and user atomically
      const instructorResult = await connection.execute(
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
          hired_date: parsedHiredDate,
          status: finalStatus,
          new_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
        { autoCommit: false },
      );

      instructor_id = instructorResult.outBinds.new_id[0];

      await connection.execute(
        `
        INSERT INTO users (
          email,
          password_hash,
          role,
          student_id,
          instructor_id,
          is_active
        ) VALUES (
          :email,
          :password_hash,
          'INSTRUCTOR',
          null,
          :instructor_id,
          'Y'
        )
        `,
        {
          email,
          password_hash,
          instructor_id,
        },
        { autoCommit: false },
      );

      await connection.commit();
    } catch (txError) {
      await connection.rollback();
      throw txError;
    }

    res.status(201).json({
      message: "Instructor and login account created successfully",
      instructor_id,
    });
  } catch (error) {
    console.error("Error creating instructor:", error);

    if (error.message.includes("ORA-00942")) {
      return res.status(500).json({
        message:
          "The users table does not exist in the database. Run server/OracleSQL/create_users_table.sql or the full schema.sql to create it.",
      });
    }
    if (error.message.includes("ORA-00001")) {
      return res.status(400).json({
        message: "Email already exists in instructors or users table",
      });
    }
    if (error.message.includes("ORA-12899") || error.message.includes("value too large")) {
      return res.status(400).json({
        message: "One or more values exceed maximum length",
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

export const deleteInstructor = async (req, res) => {
  let connection;

  try {
    const parsedId = parseId(req.params.id);
    if (parsedId === null) {
      return res.status(400).json({ message: "Invalid instructor id" });
    }
    connection = await getOracleConnection();

    // If a linked user account exists, deactivate it and block deletion for safety
    const userResult = await connection.execute(
      `
      SELECT
        user_id,
        is_active
      FROM users
      WHERE instructor_id = :id
      `,
      { id: parsedId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (userResult.rows.length > 0) {
      const linkedUser = userResult.rows[0];

      if (linkedUser.IS_ACTIVE === "Y") {
        await connection.execute(
          `UPDATE users SET is_active = 'N' WHERE user_id = :user_id`,
          { user_id: linkedUser.USER_ID },
          { autoCommit: true },
        );
      }

      return res.status(400).json({
        message:
          "Cannot delete instructor: a linked login account exists. The account has been deactivated. Remove or reassign related records (courses, enrollments, etc.) before deleting the instructor.",
      });
    }

    const result = await connection.execute(
      `DELETE FROM instructors WHERE instructor_id = :id`,
      { id: parsedId },
      { autoCommit: true },
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.status(200).json({
      message: "Instructor deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting instructor:", error);

    if (
      error.message.includes("ORA-02292") ||
      error.message.includes("integrity constraint") ||
      error.message.includes("child record found")
    ) {
      return res.status(400).json({
        message:
          "Cannot delete instructor: related records exist (courses, user accounts). Remove or reassign them first.",
      });
    }

    res.status(500).json({
      message: "Failed to delete instructor",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};
