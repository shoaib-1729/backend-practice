const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

try {
    const serviceAccountString = process.env.FIREBASE_ADMIN_CONFIG;

    if (!serviceAccountString) {
        throw new Error("FIREBASE_ADMIN_CONFIG is undefined!");
    }

    // Parse the stringified JSON from .env
    const serviceAccount = JSON.parse(serviceAccountString);

    // Initialize Firebase Admin with proper key formatting
    admin.initializeApp({
        credential: admin.credential.cert({
            ...serviceAccount,
            private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
        }),
    });


} catch (error) {
    console.error("🔥 Firebase Admin Init Error:", error.message);
}

module.exports = admin;