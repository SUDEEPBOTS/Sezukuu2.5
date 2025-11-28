import { useEffect, useState } from "react";
import axios from "axios";

export default function Admin() {
  const [cfg, setCfg] = useState({});
  const [settings, setSettings] = useState({});
  const [publicCfg, setPublicCfg] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Load all data
  useEffect(() => {
    async function load() {
      const A = await axios.get("/api/admin/bot-config");
      const B = await axios.get("/api/admin/bot-settings");
      const C = await axios.get("/api/admin/public-config");
      const D = await axios.get("/api/public-admin/list-bots");

      // Stats for dashboard
      setStats({
        totalPublicBots: D.data.totalBots || 0,
      });

      setCfg(A.data.data || {});
      setSettings(B.data.data || {});
      setPublicCfg(C.data.data || {});
      setLoading(false);
    }
    load();
  }, []);

  async function saveConfig() {
    await axios.post("/api/admin/bot-config", cfg);
    alert("Saved ✔");
  }

  async function saveSettings() {
    await axios.post("/api/admin/bot-settings", settings);
    alert("Saved ✔");
  }

  async function savePublic() {
    await axios.post("/api/admin/public-config", publicCfg);
    alert("Saved ✔");
  }

  if (loading) return <div className="p-6 text-xl">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* DASHBOARD HEADER */}
      <h1 className="text-3xl font-bold mb-6">
        Sezukuu Main — Admin Dashboard
      </h1>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        <div className="p-4 border rounded bg-white shadow-sm">
          <h3 className="text-xl font-semibold">Public Bots</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalPublicBots}</p>
        </div>

        <div className="p-4 border rounded bg-white shadow-sm">
          <h3 className="text-xl font-semibold">Public Panel</h3>
          <p className="text-lg mt-2">
            {publicCfg.publicEnabled ? "Enabled" : "Disabled"}
          </p>
        </div>

        <div className="p-4 border rounded bg-white shadow-sm">
          <h3 className="text-xl font-semibold">Admin Broadcast</h3>
          <button
            onClick={() => (window.location = "/broadcast")}
            className="mt-3 px-4 py-2 bg-black text-white rounded"
          >
            Open Broadcast
          </button>
        </div>
      </div>

      {/* CONFIG */}
      <section className="p-4 border rounded mb-6 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-3">Bot Configuration</h2>

        <input
          className="w-full mb-2 p-2 border rounded"
          placeholder="Bot Token"
          value={cfg.telegramBotToken || ""}
          onChange={(e) =>
            setCfg({ ...cfg, telegramBotToken: e.target.value })
          }
        />

        <input
          className="w-full mb-2 p-2 border rounded"
          placeholder="Owner Name"
          value={cfg.ownerName || ""}
          onChange={(e) => setCfg({ ...cfg, ownerName: e.target.value })}
        />

        <input
          className="w-full mb-2 p-2 border rounded"
          placeholder="Owner Username"
          value={cfg.ownerUsername || ""}
          onChange={(e) =>
            setCfg({ ...cfg, ownerUsername: e.target.value })
          }
        />

        <button
          onClick={saveConfig}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Save
        </button>
      </section>

      {/* SETTINGS */}
      <section className="p-4 border rounded mb-6 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-3">Bot Settings</h2>

        <input
          className="w-full mb-3 p-2 border rounded"
          placeholder="Bot Name"
          value={settings.botName || ""}
          onChange={(e) =>
            setSettings({ ...settings, botName: e.target.value })
          }
        />

        <select
          className="w-full mb-3 p-2 border rounded"
          value={settings.gender || "female"}
          onChange={(e) =>
            setSettings({ ...settings, gender: e.target.value })
          }
        >
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>

        <select
          className="w-full mb-3 p-2 border rounded"
          value={settings.personality || "normal"}
          onChange={(e) =>
            setSettings({ ...settings, personality: e.target.value })
          }
        >
          <option value="normal">Normal</option>
          <option value="flirty">Flirty</option>
          <option value="professional">Professional</option>
        </select>

        <input
          className="w-full mb-3 p-2 border rounded"
          placeholder="Support Group Link"
          value={settings.groupLink || ""}
          onChange={(e) =>
            setSettings({ ...settings, groupLink: e.target.value })
          }
        />

        <textarea
          className="w-full mb-3 p-2 border rounded"
          placeholder="Start Message"
          rows="2"
          value={settings.startMessage || ""}
          onChange={(e) =>
            setSettings({ ...settings, startMessage: e.target.value })
          }
        />

        <textarea
          className="w-full mb-3 p-2 border rounded"
          placeholder="Welcome Message"
          rows="2"
          value={settings.welcomeMessage || ""}
          onChange={(e) =>
            setSettings({ ...settings, welcomeMessage: e.target.value })
          }
        />

        <input
          className="w-full mb-3 p-2 border rounded"
          placeholder="Welcome Image URL"
          value={settings.welcomeImage || ""}
          onChange={(e) =>
            setSettings({ ...settings, welcomeImage: e.target.value })
          }
        />

        <button
          onClick={saveSettings}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Save
        </button>
      </section>

      {/* PUBLIC PANEL */}
      <section className="p-4 border rounded bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-3">Public Panel Control</h2>

        <select
          className="w-full mb-3 p-2 border rounded"
          value={publicCfg.publicEnabled}
          onChange={(e) =>
            setPublicCfg({ ...publicCfg, publicEnabled: e.target.value === "true" })
          }
        >
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>

        <textarea
          className="w-full mb-3 p-2 border rounded"
          placeholder="Public Panel OFF Message"
          rows="2"
          value={publicCfg.offMessage || ""}
          onChange={(e) =>
            setPublicCfg({ ...publicCfg, offMessage: e.target.value })
          }
        />

        <button
          onClick={savePublic}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Save
        </button>
      </section>
    </div>
  );
            }
