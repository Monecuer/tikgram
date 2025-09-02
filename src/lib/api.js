import axios from "axios";

export const API_BASE =
  import.meta.env.VITE_API_BASE || "https://tikgram-backend.onrender.com";

export const api = axios.create({ baseURL: `${API_BASE}/api` });

export function authHeaders() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete api.defaults.headers.common.Authorization;
  }
}

export function isAuthed() {
  return !!localStorage.getItem("token");
}
