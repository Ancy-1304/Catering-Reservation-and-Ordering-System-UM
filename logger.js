import { collection, addDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./firebase-init.js";

/**
 * Minimal Firestore logger
 * @param {"info"|"warn"|"error"} level
 * @param {string} message
 * @param {object} ctx
 */
export const log = (level, message, ctx = {}) =>
  addDoc(collection(db, "logs"), {
    level,
    message,
    ctx,
    ts: serverTimestamp()
  }).catch(console.error);