import { useEffect, useState } from "react";
import axios from "axios";

export default function PublicControl() {
  const [enabled, setEnabled] = useState(true);
  const [offMessage, setOffMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await axios.get("/api/admin/public-config");
      if (res.data.ok) {
        setEnabled(res.data.data.publicEnabled);
        setOffMessage(res.data.data.offMessage || "");
      }
      setLoading(false);
    }
    load();
  }, []);

  async function save() {
    await axios.post("/api/admin/public-config", {
      publicEnabled: enabled,
      offMessage
    });

    alert("Saved ✔");
  }

  if (loading) return <div className="p-6 text-xl">Loading...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Public Panel Control</h1>

      <label className="font-semibold">Public Website</label>
      <select
        className="w-full border rounded p-2 mb-4"
        value={enabled}
        onChange={(e) => setEnabled(e.target.value === "true")}
      >
        <option value="true">Enabled</option>
        <option value="false">Disabled</option>
      </select>

      <textarea
        className="w-full border rounded p-2 mb-4"
        placeholder="Message shown when Public Panel is OFF"
        rows={2}
        value={offMessage}
        onChange={(e) => setOffMessage(e.target.value)}
      />

      <button onClick={save} className="px-4 py-2 text-white bg-black rounded">
        Save
      </button>
    </div>
  );
}
