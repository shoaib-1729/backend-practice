// import { initializeApp } from "firebase/app";
// import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// // Firebase config from .env
// const firebaseConfig = {
//     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//     appId: import.meta.env.VITE_FIREBASE_APP_ID,
// };


// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const provider = new GoogleAuthProvider();

// export async function googleAuth() {
//     try {
//         const result = await signInWithPopup(auth, provider);
//         return result.user;
//     } catch (err) {
//         console.error("Google sign-in error:", err);
//         return null;
//     }
// }

// export { auth };

// firebase.js - Completely rewritten with better error handling
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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
    console.log("✅ Firebase initialized successfully");
} else {
    app = getApp(); // Use existing app
    console.log("✅ Using existing Firebase app");
}

// Initialize Auth and Provider
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Add additional scopes
provider.addScope('profile');
provider.addScope('email');

// Configure provider settings
provider.setCustomParameters({
    prompt: 'select_account'
});

// Export auth function
export async function googleAuth() {
    try {
        console.log("🚀 Starting Google authentication...");

        // Check if Firebase is properly initialized
        if (!auth || !provider) {
            throw new Error("Firebase auth not properly initialized");
        }

        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        console.log("✅ Google sign-in successful");
        console.log("User:", {
            uid: user.uid,
            email: user.email,
            name: user.displayName
        });

        return user;

    } catch (error) {
        console.error("❌ Google sign-in failed:");
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);

        // Handle specific errors
        if (error.code === 'auth/popup-closed-by-user') {
            console.log("User closed the popup");
        } else if (error.code === 'auth/popup-blocked') {
            console.log("Popup blocked by browser");
        } else if (error.code === 'auth/cancelled-popup-request') {
            console.log("Popup request was cancelled");
        }

        throw error; // Re-throw for component to handle
    }
}

// Export auth instance
export { auth };

// Debug: Add to window for testing (remove in production)
if (typeof window !== 'undefined') {
    window.firebaseAuth = auth;
    window.firebaseApp = app;
}