// lib/utils.js

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function safeJSON(data) {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return "{}";
  }
}

export function cleanText(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

export function timeNow() {
  return new Date().toISOString();
}

export function isEmpty(obj) {
  return !obj || Object.keys(obj).length === 0;
}
