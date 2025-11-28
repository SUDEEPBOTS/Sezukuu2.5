// lib/logger.js

import Log from "@/models/Log";

export async function logInfo(message, details = {}) {
  await Log.create({
    type: "info",
    message,
    details
  });
}

export async function logError(message, details = {}) {
  await Log.create({
    type: "error",
    message,
    details
  });
}

export async function logModeration(chatId, userId, message) {
  await Log.create({
    type: "moderation",
    chatId,
    userId,
    message
  });
}
