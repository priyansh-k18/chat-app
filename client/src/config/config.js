// Backend configuration
export const BACKEND_URL = "https://chat-app-backend-f8h6yuew0-priyansh-k18s-projects.vercel.app";

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    CHECK: "/api/auth/check",
    UPDATE_PROFILE: "/api/auth/update-profile"
  },
  MESSAGES: {
    USERS: "/api/messages/users",
    GET_MESSAGES: (userId) => `/api/messages/${userId}`,
    SEND_MESSAGE: (userId) => `/api/messages/send/${userId}`,
    MARK_SEEN: (messageId) => `/api/messages/mark/${messageId}`
  },
  STATUS: "/api/status"
};
