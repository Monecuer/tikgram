// E:\facegram projects\tikgram-frontend\tikgram-frontend\src\main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import Feed from "./pages/Feed.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Upload from "./pages/Upload.jsx";
import Profile from "./pages/Profile.jsx";      // <-- only ONE Profile import
import EditProfile from "./pages/EditProfile.jsx";
import Settings from "./pages/Settings.jsx";
import Reels from "./pages/Reels.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/upload" element={<Upload />} />
<Route path="/settings" element={<Settings />} />
        {/* Profiles */}
        <Route path="/profile" element={<Profile />} />     {/* me */}
        <Route path="/u/:id" element={<Profile />} />       {/* by id */}
        <Route path="/@:username" element={<Profile />} />  {/* by username */}
<Route path="/reels" element={<Reels />} />
        {/* Settings */}
        <Route path="/settings/profile" element={<EditProfile />} />

        {/* 404 */}
        <Route path="*" element={<div style={{ padding: 16 }}>Not found</div>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
