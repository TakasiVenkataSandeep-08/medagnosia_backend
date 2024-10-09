import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "../../serviceAccount.json";
import { configureGenkit } from "@genkit-ai/core";
import { defineFirestoreRetriever, firebase } from "@genkit-ai/firebase";
import { googleAI, textEmbeddingGecko001 } from "@genkit-ai/googleai";

process.env.GOOGLE_APPLICATION_CREDENTIALS = "../../serviceAccount.json";

// **Firebase configuration**
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  ...firebaseConfig,
});

export const auth = getAuth(app);

export const firestore = getFirestore(app);
configureGenkit({
  plugins: [
    firebase(),
    googleAI({
      apiVersion: ["v1", "v1beta"],
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  flowStateStore: "firebase",
  logLevel: "debug",
  traceStore: "firebase",
  enableTracingAndMetrics: true,
});

export const retrieverRef = defineFirestoreRetriever({
  name: "neet_pg_2024",
  firestore,
  collection: "neet_pg_2024_embeddings",
  contentField: "text",
  vectorField: "embedding",
  embedder: textEmbeddingGecko001,
  distanceMeasure: "COSINE",
});
