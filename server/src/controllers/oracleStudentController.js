import bcrypt from "bcrypt";
import oracledb from "oracledb";
import getOracleConnection from "../config/oracle.js";

const parseId = (id) => {
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
};

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
    const parsedId = parseId(req.params.id);
    if (parsedId === null) {
      return res.status(400).json({ message: "Invalid student id" });
    }
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
      { id: parsedId },
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
    const raw = req.body;
    const first_name = typeof raw?.first_name === "string" ? raw.first_name.trim() : "";
    const last_name = typeof raw?.last_name === "string" ? raw.last_name.trim() : "";
    const email = typeof raw?.email === "string" ? raw.email.trim() : "";
    const password = typeof raw?.password === "string" ? raw.password : "";
    const { phone, date_of_birth, status } = raw || {};

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

    let parsedDob = null;
    if (date_of_birth) {
      parsedDob = new Date(date_of_birth);
      if (Number.isNaN(parsedDob.getTime())) {
        return res.status(400).json({ message: "date_of_birth must be a valid date" });
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

    let student_id;
    try {
      // Use transaction - create student and user atomically
      const studentResult = await connection.execute(
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
          date_of_birth: parsedDob,
          status: finalStatus,
          new_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
        { autoCommit: false },
      );

      student_id = studentResult.outBinds.new_id[0];

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
          'STUDENT',
          :student_id,
          null,
          'Y'
        )
        `,
        {
          email,
          password_hash,
          student_id,
        },
        { autoCommit: false },
      );

      await connection.commit();
    } catch (txError) {
      await connection.rollback();
      throw txError;
    }

    res.status(201).json({
      message: "Student and login account created successfully",
      student_id,
    });
  } catch (error) {
    console.error("Error creating student:", error);

    if (error.message.includes("ORA-00942")) {
      return res.status(500).json({
        message:
          "The users table does not exist in the database. Run server/OracleSQL/create_users_table.sql or the full schema.sql to create it.",
      });
    }
    if (error.message.includes("ORA-00001")) {
      return res.status(400).json({
        message: "Email already exists in students or users table",
      });
    }
    if (error.message.includes("ORA-12899") || error.message.includes("value too large")) {
      return res.status(400).json({
        message: "One or more values exceed maximum length",
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

export const getStudentTotalPayments = async (req, res) => {
  let connection;

  try {
    const parsedId = parseId(req.params.id);
    if (parsedId === null) {
      return res.status(400).json({ message: "Invalid student id" });
    }
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      BEGIN
        :total := get_student_total_payments(:student_id);
      END;
      `,
      {
        total: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        student_id: parsedId,
      },
    );

    res.status(200).json({
      student_id: parsedId,
      total_paid: result.outBinds.total,
    });
  } catch (error) {
    console.error("Error fetching student total payments:", error);
    res.status(500).json({
      message: "Failed to fetch student total payments",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const deleteStudent = async (req, res) => {
  let connection;

  try {
    const parsedId = parseId(req.params.id);
    if (parsedId === null) {
      return res.status(400).json({ message: "Invalid student id" });
    }
    connection = await getOracleConnection();

    // If a linked user account exists, deactivate it and block deletion for safety
    const userResult = await connection.execute(
      `
      SELECT
        user_id,
        is_active
      FROM users
      WHERE student_id = :id
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
          "Cannot delete student: a linked login account exists. The account has been deactivated. Remove or reassign related records (enrollments, payments, etc.) before deleting the student.",
      });
    }

    const result = await connection.execute(
      `DELETE FROM students WHERE student_id = :id`,
      { id: parsedId },
      { autoCommit: true },
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);

    if (
      error.message.includes("ORA-02292") ||
      error.message.includes("integrity constraint") ||
      error.message.includes("child record found")
    ) {
      return res.status(400).json({
        message:
          "Cannot delete student: related records exist (enrollments, user accounts). Remove or reassign them first.",
      });
    }

    res.status(500).json({
      message: "Failed to delete student",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};
