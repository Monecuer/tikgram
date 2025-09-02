import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5001/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      setMsg("✅ Logged in! Redirecting...");
      setTimeout(() => (window.location.href = "/"), 1000);
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.msg || "Login failed"));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

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
          Login
        </button>

        <p className="mt-2 text-sm text-center">{msg}</p>

        {/* Navigation Links */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
          <p className="mt-1">
            Already registered?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login Again
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
