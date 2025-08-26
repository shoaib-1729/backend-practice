const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

let isInitialized = false;

try {
    const serviceAccountString = process.env.FIREBASE_ADMIN_CONFIG;

    if (!serviceAccountString) {
        throw new Error("FIREBASE_ADMIN_CONFIG is undefined!");
    }

    // Parse the stringified JSON from .env
    const serviceAccount = JSON.parse(serviceAccountString);

    // Handle private key formatting
    let privateKey = serviceAccount.private_key;
    if (privateKey) {
        privateKey = privateKey.replace(/\\n/g, '\n');
    } else {
        throw new Error("private_key is missing from service account");
    }

    // Initialize Firebase Admin
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: serviceAccount.project_id,
            clientEmail: serviceAccount.client_email,
            privateKey: privateKey
        })
    });

    isInitialized = true;

} catch (error) {
    console.error("Firebase Admin Init Error:", error.message);

    if (error instanceof SyntaxError) {
        console.error("JSON parse error - invalid JSON format");
    }
}

// Export a function to check if Firebase is initialized
module.exports = {
    admin,
    isInitialized: () => isInitialized
};