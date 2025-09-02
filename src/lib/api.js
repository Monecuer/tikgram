import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// attach / clear auth token globally
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }
};

// headers helper
export const authHeaders = () => {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// quick check
export const isAuthed = () => !!localStorage.getItem("token");

// ✅ absUrl: turn relative paths into full URLs
export const absUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
};

// boot: hydrate axios from storage
setAuthToken(localStorage.getItem("token") || "");
