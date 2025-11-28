import { useEffect, useState } from "react";
import axios from "axios";

export default function Broadcast() {
  const [bots, setBots] = useState([]);
  const [botId, setBotId] = useState("all");
  const [mode, setMode] = useState("all");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await axios.get("/api/admin/list-bots");
      setBots(res.data.bots);
    }
    load();
  }, []);

  async function send() {
    const res = await axios.post("/api/admin/broadcast", {
      botId,
      mode,
      message,
    });
    setResult(res.data);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">Broadcast Message</h1>

      {/* Select Bot */}
      <label className="block font-bold mb-1">Select Bot</label>
      <select
        className="w-full p-3 mb-4 bg-gray-200 rounded"
        value={botId}
        onChange={(e) => setBotId(e.target.value)}
      >
        <option value="all">All Bots</option>
        {bots.map((b) => (
          <option key={b._id} value={b._id}>
            {b.botName} — @{b.botUsername}
          </option>
        ))}
      </select>

      {/* Mode */}
      <label className="block font-bold mb-1">Send To</label>
      <select
        className="w-full p-3 mb-4 bg-gray-200 rounded"
        value={mode}
        onChange={(e) => setMode(e.target.value)}
      >
        <option value="all">Groups + Users</option>
        <option value="groups">Groups Only</option>
        <option value="users">Users Only</option>
      </select>

      {/* Message */}
      <textarea
        className="w-full p-3 bg-gray-200 rounded mb-4"
        rows={4}
        placeholder="Write your broadcast message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={send}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Broadcast
      </button>

      {result && (
        <div className="mt-4 p-3 bg-green-700 text-white rounded">
          Delivered To: {result.delivered} chats
        </div>
      )}
    </div>
  );
        }
