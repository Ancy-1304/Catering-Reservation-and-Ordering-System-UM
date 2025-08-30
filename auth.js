import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { auth, db } from "./firebase-init.js";
import { log } from "./logger.js";

const form   = document.getElementById("authForm");
const email  = document.getElementById("email");
const pwd    = document.getElementById("password");
const errBox = document.getElementById("error");
const toggleLink  = document.getElementById("toggleLink");
const formTitle   = document.getElementById("formTitle");
const submitBtn   = document.getElementById("submitBtn");
const toggleText  = document.getElementById("toggleText");

let isRegister = false;

if (!form || !email || !pwd || !submitBtn || !formTitle || !toggleLink || !toggleText || !errBox) {
  console.warn("auth.js: One or more auth form elements are missing.");
}

toggleLink?.addEventListener("click", (e) => {
  e.preventDefault();
  isRegister = !isRegister;
  formTitle.textContent      = isRegister ? "Register" : "Login";
  submitBtn.textContent      = isRegister ? "Register" : "Login";
  toggleText.textContent     = isRegister ? "Have an account?" : "No account?";
  toggleLink.textContent     = isRegister ? "Login here" : "Register here";
  errBox.textContent         = "";
});

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  errBox.textContent = "";
  submitBtn.disabled = true;

  try {
    const emailVal = email.value.trim();
    const pwdVal   = pwd.value.trim();
    let cred;

    if (isRegister) {
      cred = await createUserWithEmailAndPassword(auth, emailVal, pwdVal);

      await setDoc(doc(db, "users", cred.user.uid), {
        email: cred.user.email,
        role: "customer",
        createdAt: serverTimestamp(),
      });

      log("info", "User registered", { uid: cred.user.uid });
    } else {
      cred = await signInWithEmailAndPassword(auth, emailVal, pwdVal);
      log("info", "User logged in", { uid: cred.user.uid });
    }

    location.href = "index.html";
  } catch (err) {
    const map = {
      "auth/email-already-in-use": "That e-mail is already registered.",
      "auth/invalid-email":        "Enter a valid e-mail address.",
      "auth/user-not-found":       "No user found with that e-mail.",
      "auth/wrong-password":       "Incorrect password.",
      "auth/weak-password":        "Password must be at least 6 characters.",
    };
    errBox.textContent = map[err.code] || err.message;
    log("error", "Auth error", { code: err.code, message: err.message });
  } finally {
    submitBtn.disabled = false;
  }
});

onAuthStateChanged(auth, (user) => {
  if (user && location.pathname.endsWith("/login.html")) {
    location.href = "index.html";
  }
});