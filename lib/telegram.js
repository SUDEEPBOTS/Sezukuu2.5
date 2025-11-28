import axios from "axios";

export async function sendMessage(token, chatId, text, extra = {}) {
  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      ...extra
    });
  } catch (err) {
    console.error("❌ sendMessage Error:", err?.response?.data || err);
  }
}

export async function sendPhoto(token, chatId, photo, caption = "", extra = {}) {
  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, {
      chat_id: chatId,
      photo,
      caption,
      parse_mode: "Markdown",
      ...extra
    });
  } catch (err) {
    console.error("❌ sendPhoto Error:", err?.response?.data || err);
  }
}

export async function sendChatAction(token, chatId, action = "typing") {
  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendChatAction`, {
      chat_id: chatId,
      action
    });
  } catch (err) {
    console.error("❌ sendChatAction Error:", err?.response?.data || err);
  }
}

export async function deleteMessage(token, chatId, messageId) {
  try {
    await axios.post(`https://api.telegram.org/bot${token}/deleteMessage`, {
      chat_id: chatId,
      message_id: messageId
    });
  } catch (err) {
    console.error("❌ deleteMessage Error:", err?.response?.data || err);
  }
}

export async function editMessageText(token, chatId, messageId, text, extra = {}) {
  try {
    await axios.post(`https://api.telegram.org/bot${token}/editMessageText`, {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "Markdown",
      ...extra
    });
  } catch (err) {
    console.error("❌ editMessageText Error:", err?.response?.data || err);
  }
}
