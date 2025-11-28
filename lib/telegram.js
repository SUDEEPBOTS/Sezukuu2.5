// lib/telegram.js

// Base request
async function telegramRequest(token, method, body) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return data;
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
    ...extra
  });
}

// ==============================
// SEND PHOTO
// ==============================
export async function sendPhoto(token, chatId, photoUrl, caption = "", extra = {}) {
  return telegramRequest(token, "sendPhoto", {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: "Markdown",
    ...extra
  });
}

// ==============================
// EDIT MESSAGE TEXT (INLINE BUTTONS)
// ==============================
export async function editMessageText(token, chatId, messageId, text, extra = {}) {
  return telegramRequest(token, "editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "Markdown",
    ...extra
  });
}

// ==============================
// SEND TYPING ACTION
// ==============================
export async function sendChatAction(token, chatId, action = "typing") {
  return telegramRequest(token, "sendChatAction", {
    chat_id: chatId,
    action
  });
}

// ==============================
// DELETE MESSAGE
// ==============================
export async function deleteMessage(token, chatId, messageId) {
  return telegramRequest(token, "deleteMessage", {
    chat_id: chatId,
    message_id: messageId
  });
}

// ==============================
// ANSWER CALLBACK QUERY
// ==============================
export async function answerCallback(token, callbackId, text = "") {
  return telegramRequest(token, "answerCallbackQuery", {
    callback_query_id: callbackId,
    text
  });
}
