// lib/telegram.js

// Base request helper
async function telegramRequest(token, method, body) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    return await res.json();
  } catch (err) {
    console.log("❌ Telegram Error:", err);
    return null;
  }
}

// ==============================
// SEND TEXT MESSAGE
// ==============================
export async function sendMessage(token, chatId, text, extra = {}) {
  return telegramRequest(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    ...extra,
  });
}

// ==============================
// SEND TYPING
// ==============================
export async function sendChatAction(token, chatId, action = "typing") {
  return telegramRequest(token, "sendChatAction", {
    chat_id: chatId,
    action,
  });
}

// ==============================
// WEBHOOK SET
// ==============================
export async function setWebhook(token, url) {
  return telegramRequest(token, "setWebhook", { url });
}

// ==============================
// DELETE WEBHOOK
// ==============================
export async function deleteWebhook(token) {
  return telegramRequest(token, "deleteWebhook", {
    drop_pending_updates: true,
  });
}
