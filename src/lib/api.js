// src/lib/api.js
import axios from "axios";

// Backend base URL (set VITE_API_BASE in Netlify → Site settings → Environment)
const RAW = import.meta.env.VITE_API_BASE || "http://localhost:5001";

// Export both names so any component can import either.
export const API_BASE = RAW.replace(/\/+$/, "");
export const apiBase = API_BASE;

// Axios instance
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

// ---- Auth helpers ----
export function getToken() {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
    }
  } catch {
    // ignore storage failures (e.g., private mode)
  }
}

// initialize Authorization header if token already exists
const t0 = getToken();
if (t0) api.defaults.headers.common["Authorization"] = `Bearer ${t0}`;

export function isAuthed() {
  return !!getToken();
}

export function clearAuth() {
  setAuthToken(null);
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Build absolute URL for media like "uploads/xyz.mp4"
export function absUrl(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_BASE}/${u.replace(/^\/+/, "")}`;
}
