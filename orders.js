import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";
import { log } from "./logger.js";

const $list = document.getElementById("orderList");
if (!$list) console.warn("[orders.js] No #orderList element found.");

const STATUSES = ["created", "paid", "preparing", "delivered", "cancelled"];

const waitForUser = () =>
  new Promise((res) => {
    if (auth.currentUser) return res(auth.currentUser);
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) {
        unsub();
        res(u);
      }
    });
   
    setTimeout(() => res(null), 10000);
  });

const getRole = async (uid) => {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data().role ?? "customer" : "customer";
  } catch (err) {
    console.error("Failed to get user role:", err.message);
    return "customer";
  }
};

const renderSelect = (oid, current) =>
  `<select class="statusSel" data-oid="${oid}">
    ${STATUSES.map(
      (s) => `<option value="${s}" ${s === current ? "selected" : ""}>${s}</option>`
    ).join("")}
  </select>`;

const renderOrder = (id, data, admin) => {
  const li = document.createElement("li");
  li.className = "card";
  const ts = data.createdAt?.toDate().toLocaleString() ?? "";

  li.innerHTML = `
    <strong>Order&nbsp;#${id.slice(0, 6)}</strong><br>
    Total: ₹${data.total ?? 0} | Items: ${data.items?.length ?? 0}<br>
    Status: ${admin ? renderSelect(id, data.status) : `<em>${data.status}</em>`}<br>
    <small>${ts}</small>
  `;
  return li;
};

(async function init() {
  if (!$list) return;

  const user = await waitForUser();
  if (!user) return alert("Please log in to view your orders.");

  const role = await getRole(user.uid);
  const admin = role === "admin";

  const q = admin
    ? query(collection(db, "orders"), orderBy("createdAt", "desc"))
    : query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

  onSnapshot(q, (snap) => {
    $list.innerHTML = "";
    snap.forEach((d) => $list.appendChild(renderOrder(d.id, d.data(), admin)));
  });

  $list.addEventListener("change", async (e) => {
    if (!e.target.matches(".statusSel")) return;
    const { oid } = e.target.dataset;
    try {
      await updateDoc(doc(db, "orders", oid), {
        status: e.target.value,
        updatedAt: serverTimestamp(),
      });
      log("info", "Order status updated", { oid, status: e.target.value });
    } catch (err) {
      alert(err.message);
      log("error", "Failed to update status", { oid, error: err.message });
    }
  });
});