import api from "./axios";

export const getAllPayments = async () => {
  const res = await api.get("/api/oracle/payments");
  return res.data;
};

export const getPaymentById = async (paymentId) => {
  const res = await api.get(`/api/oracle/payments/${paymentId}`);
  return res.data;
};

export const getEnrollmentPayments = async (enrollmentId) => {
  const res = await api.get(
    `/api/oracle/payments/enrollment/${enrollmentId}`,
  );
  return res.data;
};

export const createPayment = async (payload) => {
  const res = await api.post("/api/oracle/payments", payload);
  return res.data;
};

export const getStudentTotalPayments = async (studentId) => {
  const res = await api.get(
    `/api/oracle/students/${studentId}/total-payments`,
  );
  return res.data;
};

