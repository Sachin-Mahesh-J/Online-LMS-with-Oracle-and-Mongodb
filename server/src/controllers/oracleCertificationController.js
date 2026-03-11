import oracledb from "oracledb";
import getOracleConnection from "../config/oracle.js";

export const getAllCertifications = async (req, res) => {
  let connection;

  try {
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        certificate_id,
        enrollment_id,
        certificate_code,
        issue_date,
        grade,
        certificate_status
      FROM certifications
      ORDER BY certificate_id
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching certifications:", error);
    res.status(500).json({
      message: "Failed to fetch certifications",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const getCertificationById = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        certificate_id,
        enrollment_id,
        certificate_code,
        issue_date,
        grade,
        certificate_status
      FROM certifications
      WHERE certificate_id = :id
      `,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Certification not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching certification:", error);
    res.status(500).json({
      message: "Failed to fetch certification",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const getCertificationByEnrollmentId = async (req, res) => {
  let connection;

  try {
    const { enrollmentId } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      SELECT
        certificate_id,
        enrollment_id,
        certificate_code,
        issue_date,
        grade,
        certificate_status
      FROM certifications
      WHERE enrollment_id = :enrollmentId
      `,
      { enrollmentId: Number(enrollmentId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No certification found for this enrollment",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching certification by enrollment:", error);
    res.status(500).json({
      message: "Failed to fetch certification for enrollment",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const createCertification = async (req, res) => {
  let connection;

  try {
    const { enrollment_id, certificate_code, grade } = req.body;

    if (!enrollment_id || !certificate_code) {
      return res.status(400).json({
        message: "enrollment_id and certificate_code are required",
      });
    }

    connection = await getOracleConnection();

    await connection.execute(
      `
      BEGIN
        issue_certificate(
          :enrollment_id,
          :certificate_code,
          :grade
        );
      END;
      `,
      {
        enrollment_id: Number(enrollment_id),
        certificate_code,
        grade: grade || null,
      },
      { autoCommit: true },
    );

    const inserted = await connection.execute(
      `
      SELECT
        certificate_id,
        enrollment_id,
        certificate_code,
        issue_date,
        grade,
        certificate_status
      FROM certifications
      WHERE enrollment_id = :enrollment_id
      `,
      { enrollment_id: Number(enrollment_id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    res.status(201).json({
      message: "Certification created successfully",
      certification: inserted.rows[0],
    });
  } catch (error) {
    console.error("Error creating certification:", error);

    if (error.message.includes("ORA-20005")) {
      return res.status(400).json({
        message: "Certificate can only be issued for completed enrollments",
      });
    }

    if (error.message.includes("ORA-20006")) {
      return res.status(400).json({
        message: "Enrollment does not exist",
      });
    }

    if (error.message.includes("ORA-20007")) {
      return res.status(400).json({
        message: "Certificate already exists for this enrollment",
      });
    }

    if (error.message.includes("ORA-00001")) {
      return res.status(400).json({
        message: "certificate_code already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create certification",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};
