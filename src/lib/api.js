// src/lib/api.js
import axios from "axios";

// Read once. Netlify: add VITE_API_BASE in Site → Settings → Environment.
const RAW = import.meta.env.VITE_API_BASE || "http://localhost:5001";
export const apiBase = RAW.replace(/\/+$/, ""); // strip trailing slash

export const api = axios.create({
  baseURL: apiBase,
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

export function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Build absolute URLs for media paths coming from backend (e.g. "uploads/xyz.mp4")
export function absUrl(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${apiBase}/${u.replace(/^\/+/, "")}`;
}
