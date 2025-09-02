import { useState } from "react";
import axios from "axios";

export default function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5001/api/auth/signup", form);
      setMsg("✅ Account created! You can now login.");
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.msg || "Signup failed"));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Sign Up</h2>
        <input
          className="border p-2 w-full mb-2 rounded"
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          className="border p-2 w-full mb-2 rounded"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="border p-2 w-full mb-2 rounded"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="bg-blue-500 text-white p-2 rounded w-full">
          Sign Up
        </button>
        <p className="mt-2 text-sm text-center">{msg}</p>
      </form>
    </div>
  );
}
