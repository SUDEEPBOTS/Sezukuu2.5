import { useEffect, useState } from "react";
import axios from "axios";

export default function Admin() {
  const [cfg, setCfg] = useState({});
  const [settings, setSettings] = useState({});
  const [publicCfg, setPublicCfg] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // LOAD ALL
  useEffect(() => {
    async function load() {
      try {
        const A = await axios.get("/api/admin/bot-config");
        const B = await axios.get("/api/admin/bot-settings");
        const C = await axios.get("/api/admin/public-config");
        const D = await axios.get("/api/public-admin/list-bots");

        setCfg(A.data.data || {});
        setSettings(B.data.data || {});
        setPublicCfg(C.data.data || {});

        setStats({
          totalPublicBots: D.data.totalBots || 0,
        });
      } catch (err) {
        console.log("LOAD ERROR:", err);
      }

      setLoading(false);
    }
    load();
  }, []);

  // SAVE FUNCTIONS
  async function saveConfig() {
    await axios.post("/api/admin/bot-config", cfg);
    alert("Bot Config Saved ✔");
  }

  async function saveSettings() {
    await axios.post("/api/admin/bot-settings", settings);
    alert("Bot Settings Saved ✔");
  }

  async function savePublic() {
    await axios.post("/api/admin/public-config", publicCfg);
    alert("Public Panel Updated ✔");
  }

  if (loading) return <div className="p-6 text-xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-6">
          Sezukuu Main — Admin Dashboard
        </h1>

        {/* DASHBOARD CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          <div className="p-4 bg-white border rounded shadow">
            <h3 className="text-xl font-semibold">Public Bots</h3>
            <p className="text-3xl font-bold">{stats.totalPublicBots}</p>
          </div>

          <div className="p-4 bg-white border rounded shadow">
            <h3 className="text-xl font-semibold">Public Panel</h3>
            <p className="mt-1 text-lg">
              {publicCfg.publicEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>

          <div className="p-4 bg-white border rounded shadow">
            <h3 className="text-xl font-semibold">Admin Broadcast</h3>
            <button
              onClick={() => (window.location = "/broadcast")}
              className="mt-3 px-4 py-2 bg-black text-white rounded"
            >
              Open Broadcast
            </button>
          </div>
        </div>

        {/* MAIN BOT CONFIG */}
        <section className="p-4 bg-white border rounded shadow mb-6">
          <h2 className="text-xl font-bold mb-3">Bot Configuration</h2>

          <input
            className="w-full p-2 border rounded mb-3"
            placeholder="Bot Token"
            value={cfg.telegramBotToken || ""}
            onChange={(e) =>
              setCfg({ ...cfg, telegramBotToken: e.target.value })
            }
          />

          <input
            className="w-full p-2 border rounded mb-3"
            placeholder="Owner Name"
            value={cfg.ownerName || ""}
            onChange={(e) =>
              setCfg({ ...cfg, ownerName: e.target.value })
            }
          />

          <input
            className="w-full p-2 border rounded mb-3"
            placeholder="Owner Username (@...)"
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
        <section className="p-4 bg-white border rounded shadow mb-6">
          <h2 className="text-xl font-bold mb-3">Bot Settings</h2>

          <input
            className="w-full p-2 border rounded mb-3"
            placeholder="Bot Name"
            value={settings.botName || ""}
            onChange={(e) =>
              setSettings({ ...settings, botName: e.target.value })
            }
          />

          <select
            className="w-full p-2 border rounded mb-3"
            value={settings.gender || "female"}
            onChange={(e) =>
              setSettings({ ...settings, gender: e.target.value })
            }
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>

          <select
            className="w-full p-2 border rounded mb-3"
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
            className="w-full p-2 border rounded mb-3"
            placeholder="Support Group Link"
            value={settings.groupLink || ""}
            onChange={(e) =>
              setSettings({ ...settings, groupLink: e.target.value })
            }
          />

          <textarea
            className="w-full p-2 border rounded mb-3"
            placeholder="Start Message"
            rows="2"
            value={settings.startMessage || ""}
            onChange={(e) =>
              setSettings({ ...settings, startMessage: e.target.value })
            }
          />

          <textarea
            className="w-full p-2 border rounded mb-3"
            placeholder="Welcome Message"
            rows="2"
            value={settings.welcomeMessage || ""}
            onChange={(e) =>
              setSettings({ ...settings, welcomeMessage: e.target.value })
            }
          />

          <input
            className="w-full p-2 border rounded mb-3"
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

        {/* PUBLIC PANEL CONFIG */}
        <section className="p-4 bg-white border rounded shadow mb-6">
          <h2 className="text-xl font-bold mb-3">Public Panel Control</h2>

          <select
            className="w-full p-2 border rounded mb-3"
            value={publicCfg.publicEnabled ? "true" : "false"}
            onChange={(e) =>
              setPublicCfg({
                ...publicCfg,
                publicEnabled: e.target.value === "true",
              })
            }
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>

          <textarea
            className="w-full p-2 border rounded mb-3"
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
    </div>
  );
}
