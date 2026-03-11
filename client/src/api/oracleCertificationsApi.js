import api from "./axios";

const normalizeCertification = (row) => {
  if (!row) return null;

  return {
    certificate_id: row.CERTIFICATE_ID ?? row.certificate_id ?? null,
    enrollment_id: row.ENROLLMENT_ID ?? row.enrollment_id ?? null,
    certificate_code: row.CERTIFICATE_CODE ?? row.certificate_code ?? null,
    issue_date: row.ISSUE_DATE ?? row.issue_date ?? null,
    grade: row.GRADE ?? row.grade ?? null,
    certificate_status: row.CERTIFICATE_STATUS ?? row.certificate_status ?? null,
    student_id: row.STUDENT_ID ?? row.student_id ?? null,
    course_id: row.COURSE_ID ?? row.course_id ?? null,
    course_title: row.COURSE_TITLE ?? row.course_title ?? null,
    completion_status: row.COMPLETION_STATUS ?? row.completion_status ?? null,
    progress_percent: row.PROGRESS_PERCENT ?? row.progress_percent ?? null,
    first_name: row.FIRST_NAME ?? row.first_name ?? null,
    last_name: row.LAST_NAME ?? row.last_name ?? null,
  };
};

export const getStudentCertificates = async (studentId) => {
  const res = await api.get(`/api/oracle/certifications/student/${studentId}`);
  return (res.data || []).map(normalizeCertification);
};

export const getCourseCertificates = async (courseId) => {
  const res = await api.get(`/api/oracle/certifications/course/${courseId}`);
  return (res.data || []).map(normalizeCertification);
};

export const getCertificateById = async (certificateId) => {
  const res = await api.get(`/api/oracle/certifications/${certificateId}`);
  return normalizeCertification(res.data);
};

export const getCertificateByEnrollmentId = async (enrollmentId) => {
  const res = await api.get(
    `/api/oracle/certifications/enrollment/${enrollmentId}`,
  );
  return normalizeCertification(res.data);
};

export const issueCertificate = async (payload) => {
  const res = await api.post("/api/oracle/certifications", payload);
  return {
    ...res.data,
    certification: normalizeCertification(res.data?.certification),
  };
};
