import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminPanel() {
  const [botToken, setBotToken] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerUsername, setOwnerUsername] = useState("");
  const [botName, setBotName] = useState("");
  const [gender, setGender] = useState("female");
  const [personality, setPersonality] = useState("normal");
  const [groupLink, setGroupLink] = useState("");
  const [startMessage, setStartMessage] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [welcomeImage, setWelcomeImage] = useState("");

  const [publicEnabled, setPublicEnabled] = useState(true);
  const [publicOffMessage, setPublicOffMessage] = useState("");

  const [loading, setLoading] = useState(true);

  // =======================
  // LOAD SETTINGS FROM DB
  // =======================
  useEffect(() => {
    async function load() {
      const bot = await axios.get("/api/admin/bot-config");
      const settings = await axios.get("/api/admin/bot-settings");
      const pub = await axios.get("/api/admin/public-config");

      if (bot.data.ok) {
        setBotToken(bot.data.data.telegramBotToken || "");
        setOwnerName(bot.data.data.ownerName || "");
        setOwnerUsername(bot.data.data.ownerUsername || "");
      }

      if (settings.data.ok) {
        const s = settings.data.data;
        setBotName(s.botName || "");
        setGender(s.gender || "female");
        setPersonality(s.personality || "normal");
        setGroupLink(s.groupLink || "");
        setStartMessage(s.startMessage || "");
        setWelcomeMessage(s.welcomeMessage || "");
        setWelcomeImage(s.welcomeImage || "");
      }

      if (pub.data.ok) {
        setPublicEnabled(pub.data.data.publicEnabled);
        setPublicOffMessage(pub.data.data.offMessage || "");
      }

      setLoading(false);
    }

    load();
  }, []);

  // =======================
  // SAVE CONFIG
  // =======================
  async function saveConfig() {
    await axios.post("/api/admin/bot-config", {
      telegramBotToken: botToken,
      ownerName,
      ownerUsername
    });
    alert("Saved ✔");
  }

  async function saveSettings() {
    await axios.post("/api/admin/bot-settings", {
      botName,
      gender,
      personality,
      groupLink,
      startMessage,
      welcomeMessage,
      welcomeImage
    });
    alert("Saved ✔");
  }

  async function savePublic() {
    await axios.post("/api/admin/public-config", {
      publicEnabled,
      offMessage: publicOffMessage
    });
    alert("Public Panel Updated ✔");
  }

  if (loading) return <div className="p-6 text-xl">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6">Sezukuu 2.5 — Admin Panel</h1>

      {/* BOT CONFIG SECTION */}
      <div className="p-4 border rounded mb-6">
        <h2 className="text-xl font-bold mb-3">Bot Configuration</h2>

        <input
          placeholder="Bot Token"
          className="w-full p-2 border rounded mb-2"
          value={botToken}
          onChange={(e) => setBotToken(e.target.value)}
        />

        <input
          placeholder="Owner Name"
          className="w-full p-2 border rounded mb-2"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
        />

        <input
          placeholder="Owner Username (@username)"
          className="w-full p-2 border rounded mb-2"
          value={ownerUsername}
          onChange={(e) => setOwnerUsername(e.target.value)}
        />

        <button
          onClick={saveConfig}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Save Config
        </button>
      </div>

      {/* BOT SETTINGS */}
      <div className="p-4 border rounded mb-6">
        <h2 className="text-xl font-bold mb-3">Bot Settings</h2>

        <input
          placeholder="Bot Name"
          className="w-full p-2 border rounded mb-2"
          value={botName}
          onChange={(e) => setBotName(e.target.value)}
        />

        {/* Gender */}
        <label className="block font-semibold mb-1">Gender</label>
        <select
          className="w-full p-2 border rounded mb-3"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>

        {/* Personality */}
        <label className="block font-semibold mb-1">Personality</label>
        <select
          className="w-full p-2 border rounded mb-3"
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
        >
          <option value="normal">Normal</option>
          <option value="flirty">Flirty</option>
          <option value="professional">Professional</option>
        </select>

        <input
          placeholder="Support Group Link"
          className="w-full p-2 border rounded mb-2"
          value={groupLink}
          onChange={(e) => setGroupLink(e.target.value)}
        />

        <textarea
          placeholder="Start Message"
          className="w-full p-2 border rounded mb-2"
          rows={2}
          value={startMessage}
          onChange={(e) => setStartMessage(e.target.value)}
        />

        <textarea
          placeholder="Welcome Message"
          className="w-full p-2 border rounded mb-2"
          rows={2}
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
        />

        <input
          placeholder="Welcome Image URL"
          className="w-full p-2 border rounded mb-2"
          value={welcomeImage}
          onChange={(e) => setWelcomeImage(e.target.value)}
        />

        <button
          onClick={saveSettings}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Save Settings
        </button>
      </div>

      {/* PUBLIC PANEL CONTROL */}
      <div className="p-4 border rounded mb-6">
        <h2 className="text-xl font-bold mb-3">Public Panel Control</h2>

        <label className="font-semibold">Public Panel</label>
        <select
          className="w-full p-2 border rounded mb-3"
          value={publicEnabled}
          onChange={(e) => setPublicEnabled(e.target.value === "true")}
        >
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>

        <textarea
          placeholder="OFF Message (shown when disabled)"
          className="w-full p-2 border rounded mb-2"
          rows={2}
          value={publicOffMessage}
          onChange={(e) => setPublicOffMessage(e.target.value)}
        />

        <button
          onClick={savePublic}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Save Public Panel
        </button>
      </div>
    </div>
  );
            }
