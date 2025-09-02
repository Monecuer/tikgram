import NeonCard from "../components/animated/NeonCard";
import { Link } from "react-router-dom";

export default function Settings() {
  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      <NeonCard className="p-4">
        <div className="font-semibold mb-2">Profile</div>
        <div className="text-sm text-white/70 mb-3">Edit your avatar and bio.</div>
        <Link to="/settings/profile" className="inline-block px-4 py-2 rounded-xl bg-primary text-black">
          Edit Profile
        </Link>
      </NeonCard>

      <NeonCard className="p-4">
        <div className="font-semibold mb-2">Privacy</div>
        <div className="text-sm text-white/70">Control who can see your liked posts, allow remixing, and let others find you by email/phone.</div>
        <div className="mt-3 grid grid-cols-1 gap-2">
          <Toggle label="Public Liked Tab" />
          <Toggle label="Allow Remixes" defaultChecked />
          <Toggle label="Discoverable by email" />
        </div>
      </NeonCard>

      <NeonCard className="p-4">
        <div className="font-semibold mb-2">Notifications</div>
        <div className="text-sm text-white/70">Likes, comments, follows, reactions.</div>
        <div className="mt-3 grid grid-cols-1 gap-2">
          <Toggle label="Likes" defaultChecked />
          <Toggle label="Comments" defaultChecked />
          <Toggle label="Follows" defaultChecked />
          <Toggle label="Reactions" defaultChecked />
        </div>
      </NeonCard>

      <NeonCard className="p-4">
        <div className="font-semibold mb-2">Appearance</div>
        <div className="text-sm text-white/70">Theme & motion preferences.</div>
        <div className="mt-3 grid grid-cols-1 gap-2">
          <Toggle label="Reduce Motion (follow system)" />
          <Toggle label="High Contrast" />
        </div>
      </NeonCard>

      <NeonCard className="p-4">
        <div className="font-semibold mb-2">Account</div>
        <div className="text-sm text-white/70">Security & login.</div>
        <div className="mt-3 grid grid-cols-1 gap-2">
          <button className="px-4 py-2 rounded-xl bg-white/10">Change Password</button>
          <button className="px-4 py-2 rounded-xl bg-white/10">Two-Factor Auth</button>
          <button className="px-4 py-2 rounded-xl bg-white/10">Export Data</button>
        </div>
      </NeonCard>
    </div>
  );
}

function Toggle({ label, defaultChecked = false }) {
  return (
    <label className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-glass">
      <span>{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="h-5 w-5 accent-[#7cffc4]" />
    </label>
  );
}
