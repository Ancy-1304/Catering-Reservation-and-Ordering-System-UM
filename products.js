import {
  collection,
  getDoc,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./firebase-init.js";
import { log } from "./logger.js";

const $list = document.getElementById("productList");
const cardTpl = document.getElementById("productCard");
const admin = location.pathname.endsWith("/admin.html");

if ($list && cardTpl) {
  onSnapshot(collection(db, "products"), (snap) => {
    $list.innerHTML = "";
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const card = cardTpl.content.cloneNode(true);
      card.querySelector(".thumb").src = data.image || "https://placehold.co/400x300";
      card.querySelector(".name").textContent = data.name;
      card.querySelector(".price").textContent = `₹ ${data.price}`;
      card.querySelector(".addBtn").onclick = () => window.addToCart(docSnap.id, data);
      $list.appendChild(card);
    });
  });
}

if (admin) {
  const form = document.getElementById("productForm");
  const pMsg = document.getElementById("pMsg");
  const table = document.querySelector("#adminTable tbody");

  onSnapshot(collection(db, "products"), (snap) => {
    table.innerHTML = "";
    snap.forEach((d) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.data().name}</td>
        <td>₹ ${d.data().price}</td>
        <td><button data-edit="${d.id}">✏️</button></td>
        <td><button data-del="${d.id}">🗑️</button></td>
      `;
      table.appendChild(tr);
    });
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const pid = document.getElementById("pid").value;
    const data = {
      name: document.getElementById("name").value,
      price: +document.getElementById("price").value,
      image: document.getElementById("image").value,
    };
    try {
      if (pid) {
        await updateDoc(doc(db, "products", pid), data);
        log("info", "Product updated", { pid, ...data });
      } else {
        await addDoc(collection(db, "products"), data);
        log("info", "Product created", data);
      }
      form.reset();
      document.getElementById("pid").value = "";
      pMsg.textContent = "Saved!";
      setTimeout(() => (pMsg.textContent = ""), 1500);
    } catch (err) {
      alert("Error saving product: " + err.message);
    }
  };

  table.onclick = async (e) => {
    const id = e.target.dataset.edit || e.target.dataset.del;
    if (!id) return;

    if (e.target.dataset.edit) {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (snap.exists()) {
          const data = snap.data();
          document.getElementById("pid").value = id;
          document.getElementById("name").value = data.name;
          document.getElementById("price").value = data.price;
          document.getElementById("image").value = data.image;
        } else {
          alert("Product not found.");
        }
      } catch (err) {
        alert("Failed to fetch product for editing: " + err.message);
      }
    } else if (confirm("Delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        log("warn", "Product deleted", { id });
      } catch (err) {
        alert("Error deleting product: " + err.message);
      }
    }
  };
}