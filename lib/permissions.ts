export type UserRole = "TEACHER" | "STUDENT" | "ADMIN";

export const canManageRoles = (role: UserRole) => role === "ADMIN";

export const canAccessAdminPanel = (role: UserRole) => role === "ADMIN";

export const canCreateQuiz = (role: UserRole) => role === "TEACHER";

export const canActivateSession = (role: UserRole) => role === "TEACHER";

export const canManageFlags = (role: UserRole) => role === "TEACHER";

export const canTakeExam = (role: UserRole) => role === "STUDENT";
