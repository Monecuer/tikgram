import { useState } from "react";
import axios from "axios";
import NeonCard from "../components/animated/NeonCard";

export default function Upload() {
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState(null);
  const [msg, setMsg] = useState("");
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!media) return setMsg("❌ Please select a file");

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("media", media);

    try {
      await axios.post("http://localhost:5001/api/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMsg("✅ Post uploaded!");
      setCaption("");
      setMedia(null);
    } catch (err) {
      setMsg("❌ Upload failed");
    }
  };
  <NeonCard className="w-full max-w-sm p-6">
  {/* the form fields you already have */}
</NeonCard>


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Upload Post</h2>
        <input
          type="text"
          placeholder="Caption"
          className="border p-2 w-full mb-2 rounded"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <input
          type="file"
          className="border p-2 w-full mb-2 rounded"
          onChange={(e) => setMedia(e.target.files[0])}
        />
        <button className="bg-green-500 text-white p-2 rounded w-full">
          Upload
        </button>
        <p className="mt-2 text-sm text-center">{msg}</p>
      </form>
    </div>
  );
}
