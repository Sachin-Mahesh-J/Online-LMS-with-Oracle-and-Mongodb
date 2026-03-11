import api from "./axios";

export const login = async (payload) => {
  const res = await api.post("/api/auth/login", payload);
  return res.data;
};

export const getMe = async () => {
  const res = await api.get("/api/auth/me");
  return res.data;
};
