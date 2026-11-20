import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA2uJoQ4_TN8nS9sOdQg85LfObqUD_39pw",
  authDomain: "saffron-coast.firebaseapp.com",
  databaseURL: "https://saffron-coast-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "saffron-coast",
  storageBucket: "saffron-coast.firebasestorage.app",
  messagingSenderId: "458015663365",
  appId: "1:458015663365:web:ab5c111d5b13e3d214436c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const $ = (id) => document.getElementById(id);
const gate = $("authGate");
const form = $("authForm");
const title = $("authTitle");
const description = $("authDescription");
const nameField = $("authNameField");
const nameInput = $("authName");
const emailInput = $("authEmail");
const passwordInput = $("authPassword");
const submit = $("authSubmit");
const switchLine = $("authSwitchLine");
const switchButton = $("authSwitch");
const forgot = $("authForgot");
const message = $("authMessage");
const showPassword = $("authShowPassword");
const accountName = $("accountName");
const accountEmail = $("accountEmail");
const logout = $("accountLogout");

let mode = "login";
let authReady = false;

function say(text, success = false) {
  message.textContent = text;
  message.className = success ? "auth-message success" : "auth-message";
}

function errorText(error) {
  const messages = {
    "auth/email-already-in-use": "That email already has an account. Try signing in.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/weak-password": "Choose a password with at least 6 characters.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/operation-not-allowed": "Email/Password sign-in is not enabled in Firebase.",
    "auth/unauthorized-domain": "This website domain is not authorized in Firebase."
  };
  return messages[error.code] || "Could not complete that request. Please try again.";
}

function setMode(nextMode) {
  mode = nextMode;
  const signup = mode === "signup";
  title.textContent = signup ? "Create your account" : "Welcome back";
  description.textContent = signup
    ? "Sign up to enter the streets of Saffron Coast."
    : "Sign in to continue your drive.";
  nameField.hidden = !signup;
  nameInput.required = signup;
  forgot.hidden = signup;
  submit.textContent = signup ? "CREATE ACCOUNT" : "SIGN IN";
  switchLine.firstChild.textContent = signup
    ? "Already registered? "
    : "New to Saffron Coast? ";
  switchButton.textContent = signup ? "Sign in" : "Create account";
  say("");
}

switchButton.addEventListener("click", () => {
  setMode(mode === "login" ? "signup" : "login");
});

showPassword.addEventListener("click", () => {
  const visible = passwordInput.type === "password";
  passwordInput.type = visible ? "text" : "password";
  showPassword.textContent = visible ? "Hide" : "Show";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  submit.disabled = true;
  say(mode === "signup" ? "Creating your account..." : "Signing you in...");

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    if (mode === "signup") {
      const displayName = nameInput.value.trim();
      if (!displayName) {
        say("Please enter your name.");
        return;
      }
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName });
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (error) {
    say(errorText(error));
  } finally {
    submit.disabled = false;
  }
});

forgot.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email) {
    say("Enter your email address first.");
    emailInput.focus();
    return;
  }
  forgot.disabled = true;
  try {
    await sendPasswordResetEmail(auth, email);
    say("Password reset email sent. Check your inbox.", true);
  } catch (error) {
    say(errorText(error));
  } finally {
    forgot.disabled = false;
  }
});

logout.addEventListener("click", async () => {
  logout.disabled = true;
  try {
    await signOut(auth);
  } catch (error) {
    say(errorText(error));
  } finally {
    logout.disabled = false;
  }
});

onAuthStateChanged(auth, (user) => {
  authReady = true;
  if (user) {
    gate.hidden = true;
    accountName.textContent = user.displayName || "Driver";
    accountEmail.textContent = user.email || "";
    $("accountBar").hidden = false;
  } else {
    gate.hidden = false;
    $("accountBar").hidden = true;
    if (!authReady) say("Checking your sign-in...");
  }
});
