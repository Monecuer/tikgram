// src/lib/api.js
import axios from "axios";

// Base URL (set VITE_API_BASE in Netlify → Site settings → Environment)
const RAW = import.meta.env.VITE_API_BASE || "http://localhost:5001";
export const apiBase = RAW.replace(/\/+$/, ""); // strip trailing slash(s)

export const api = axios.create({
  baseURL: apiBase,
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

export function getToken() {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export function isAuthed() {
  return !!getToken();
}

export function clearAuth() {
  try {
    localStorage.removeItem("token");
  } catch {}
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Build absolute URLs for media like "uploads/xyz.mp4"
export function absUrl(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${apiBase}/${u.replace(/^\/+/, "")}`;
}
