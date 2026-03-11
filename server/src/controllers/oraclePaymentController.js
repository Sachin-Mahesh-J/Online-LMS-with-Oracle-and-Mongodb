import oracledb from "oracledb";
import getOracleConnection from "../config/oracle.js";

export const getAllPayments = async (req, res) => {
  let connection;

  try {
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        payment_id,
        enrollment_id,
        amount,
        payment_date,
        payment_method,
        payment_status
      FROM payments
      ORDER BY payment_id
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      message: "Failed to fetch payments",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const getPaymentById = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        payment_id,
        enrollment_id,
        amount,
        payment_date,
        payment_method,
        payment_status
      FROM payments
      WHERE payment_id = :id
      `,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      message: "Failed to fetch payment",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const getPaymentsByEnrollmentId = async (req, res) => {
  let connection;

  try {
    const { enrollmentId } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        payment_id,
        enrollment_id,
        amount,
        payment_date,
        payment_method,
        payment_status
      FROM payments
      WHERE enrollment_id = :enrollmentId
      ORDER BY payment_date DESC, payment_id DESC
      `,
      { enrollmentId: Number(enrollmentId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching enrollment payments:", error);
    res.status(500).json({
      message: "Failed to fetch payments for enrollment",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const createPayment = async (req, res) => {
  let connection;

  try {
    const { enrollment_id, amount, payment_method, payment_status } = req.body;

    if (!enrollment_id || amount === undefined) {
      return res.status(400).json({
        message: "enrollment_id and amount are required",
      });
    }

    const finalStatus = payment_status || "PENDING";

    if (!["PENDING", "PAID", "FAILED"].includes(finalStatus)) {
      return res.status(400).json({
        message: "payment_status must be PENDING, PAID, or FAILED",
      });
    }

    if (Number(amount) < 0) {
      return res.status(400).json({
        message: "amount must be 0 or greater",
      });
    }

    connection = await getOracleConnection();

    await connection.execute(
      `
      BEGIN
        record_payment(
          :enrollment_id,
          :amount,
          :payment_method,
          :payment_status
        );
      END;
      `,
      {
        enrollment_id: Number(enrollment_id),
        amount: Number(amount),
        payment_method: payment_method || null,
        payment_status: finalStatus,
      },
      { autoCommit: true },
    );

    const inserted = await connection.execute(
      `
      SELECT
        payment_id,
        enrollment_id,
        amount,
        payment_date,
        payment_method,
        payment_status
      FROM payments
      WHERE payment_id = (
        SELECT MAX(payment_id)
        FROM payments
        WHERE enrollment_id = :enrollment_id
      )
      `,
      { enrollment_id: Number(enrollment_id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    res.status(201).json({
      message: "Payment recorded successfully",
      payment: inserted.rows[0],
    });
  } catch (error) {
    console.error("Error creating payment:", error);

    if (error.message.includes("ORA-20004")) {
      return res.status(400).json({
        message: "Enrollment does not exist",
      });
    }

    res.status(500).json({
      message: "Failed to create payment",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};
