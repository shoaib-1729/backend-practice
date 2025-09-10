import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import toast from "react-hot-toast";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Prevent multiple initialization
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Use existing app
}

// Initialize Auth and Provider
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Add additional scopes
provider.addScope("profile");
provider.addScope("email");

// Configure provider settings
provider.setCustomParameters({
  prompt: "select_account",
});

// Export auth function
export async function googleAuth() {
  try {
    // Check if Firebase is properly initialized
    if (!auth || !provider) {
      throw new Error("Firebase auth not properly initialized");
    }

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    return user;
  } catch (error) {
    // Handle specific errors
    if (error.code === "auth/popup-closed-by-user") {
      toast.error("User closed the popup");
    } else if (error.code === "auth/popup-blocked") {
      toast.error("Popup blocked by browser");
    } else if (error.code === "auth/cancelled-popup-request") {
      toast.error("Popup request was cancelled");
    }

    throw error; // Re-throw for component to handle
  }
}

// Export auth instance
export { auth };

// Debug: Add to window for testing (remove in production)
if (typeof window !== "undefined") {
  window.firebaseAuth = auth;
  window.firebaseApp = app;
}
