export const Auth = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  const role = req.headers["x-role"];
  const email = req.headers["x-email"];
  const studentId = req.headers["x-student-id"];
  const instructorId = req.headers["x-instructor-id"];

  if (!userId || !role) {
    return res.status(401).json({
      message: "Not logged in",
    });
  }

  req.user = {
    user_id: Number(userId),
    email: email || null,
    role: String(role).toUpperCase(),
    student_id: studentId ? Number(studentId) : null,
    instructor_id: instructorId ? Number(instructorId) : null,
  };

  next();
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
};

export const requireStudent = authorizeRoles("STUDENT");
export const requireInstructor = authorizeRoles("INSTRUCTOR");
export const requireAdmin = authorizeRoles("ADMIN");
export const requireInstructorOrAdmin = authorizeRoles("INSTRUCTOR", "ADMIN");
export const requireAnyUser = authorizeRoles("STUDENT", "INSTRUCTOR", "ADMIN");
