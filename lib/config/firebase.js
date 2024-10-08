"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieverRef = exports.firestore = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const core_1 = require("@genkit-ai/core");
const firebase_1 = require("@genkit-ai/firebase");
const googleai_1 = require("@genkit-ai/googleai");
const serviceAccount = require("../../medagnosia-firebase-adminsdk-rx0j9-a635b4ab18.json");
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
const app = admin.initializeApp(Object.assign({ credential: admin.credential.cert(serviceAccount) }, firebaseConfig));
(0, core_1.configureGenkit)({
    plugins: [(0, firebase_1.firebase)(), (0, googleai_1.googleAI)({ apiVersion: ["v1", "v1beta"] })],
    flowStateStore: "firebase",
    logLevel: "debug",
    traceStore: "firebase",
    enableTracingAndMetrics: true,
});
exports.firestore = (0, firestore_1.getFirestore)(app);
exports.retrieverRef = (0, firebase_1.defineFirestoreRetriever)({
    name: "neet_pg_2024",
    firestore: exports.firestore,
    collection: "neet_pg_2024_embeddings",
    contentField: "text",
    vectorField: "embedding",
    embedder: googleai_1.textEmbeddingGecko001,
    distanceMeasure: "COSINE",
});
//# sourceMappingURL=firebase.js.map