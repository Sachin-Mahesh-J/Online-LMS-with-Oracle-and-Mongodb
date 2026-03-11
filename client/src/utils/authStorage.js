export const AUTH_STORAGE_KEY = "lms_auth_user";

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (!parsed || !parsed.user_id || !parsed.role) return null;

    return {
      ...parsed,
      role: String(parsed.role).toUpperCase(),
    };
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
};

export const clearStoredUser = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};
