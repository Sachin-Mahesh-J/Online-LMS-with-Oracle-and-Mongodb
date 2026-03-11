import axios from "axios";
import { getStoredUser } from "../utils/authStorage";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const user = getStoredUser();

  if (user) {
    config.headers = config.headers || {};
    config.headers["x-user-id"] = user.user_id;
    config.headers["x-role"] = user.role;
    if (user.email) config.headers["x-email"] = user.email;
    if (user.student_id) config.headers["x-student-id"] = user.student_id;
    if (user.instructor_id) config.headers["x-instructor-id"] = user.instructor_id;
  }

  return config;
});

export default api;
