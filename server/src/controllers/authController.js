import bcrypt from "bcrypt";
import oracledb from "oracledb";
import getOracleConnection from "../config/oracle.js";

export const login = async (req, res) => {
  let connection;

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required",
      });
    }

    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        user_id,
        email,
        password_hash,
        role,
        student_id,
        instructor_id,
        is_active
      FROM users
      WHERE LOWER(email) = LOWER(:email)
      `,
      { email: email.trim() },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    if (user.IS_ACTIVE !== "Y") {
      return res.status(403).json({
        message: "Account is inactive",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.PASSWORD_HASH);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      user: {
        user_id: user.USER_ID,
        email: user.EMAIL,
        role: user.ROLE,
        student_id: user.STUDENT_ID,
        instructor_id: user.INSTRUCTOR_ID,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
};
