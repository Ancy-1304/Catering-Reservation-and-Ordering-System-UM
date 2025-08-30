import { log } from "./logger.js";
import {
  doc,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db, auth } from "./firebase-init.js";

const cart = JSON.parse(localStorage.getItem("cart") || "[]");
const $count = document.getElementById("cartCount");

updateCount();

window.addToCart = (pid, data) => {
  const existing = cart.find((item) => item.pid === pid);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ pid, ...data, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCount();
  log("info", "Add to cart", { pid });
};

export async function placeOrder() {
  if (!auth.currentUser) return alert("Please login to place order.");
  if (!cart.length) return alert("Cart is empty!");

  try {
    await addDoc(collection(db, "orders"), {
      userId: auth.currentUser.uid,
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
      status: "created",
      createdAt: serverTimestamp(),
    });

    localStorage.removeItem("cart");
    alert("Order placed!");
    updateCount();
    log("info", "Order placed");

    window.location.href = "orders.html";
  } catch (err) {
    console.error("Order failed:", err.message);
    alert("Failed to place order. Try again.");
    log("error", "Order placement failed", { error: err.message });
  }
}

function updateCount() {
  if ($count) $count.textContent = `🛒 ${cart.length}`;
}