"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexNEETPGData = indexNEETPGData;
const embedder_1 = require("@genkit-ai/ai/embedder");
const llm_chunk_1 = require("llm-chunk");
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const firebase_1 = require("../config/firebase");
const googleai_1 = require("@genkit-ai/googleai");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
const fs_1 = __importDefault(require("fs"));
const firestore_1 = require("firebase-admin/firestore");
const BatchWriter_1 = require("../utils/BatchWriter");
async function listFiles(dir) {
    const entries = await (0, promises_1.readdir)(dir, { withFileTypes: true });
    const files = await Promise.all(entries.map((entry) => {
        const res = path_1.default.resolve(dir, entry.name);
        return entry.isDirectory() ? listFiles(res) : res;
    }));
    return files.flat();
}
async function checkAndDeletePath(filePath) {
    const collectionRef = firebase_1.firestore.collection("neet_pg_2024_embeddings");
    const querySnapshot = await collectionRef.where("path", "==", filePath).get();
    if (!querySnapshot.empty) {
        console.log(`Deleting existing documents for ${filePath}`);
        const batch = new BatchWriter_1.BatchWriter(100, firebase_1.firestore);
        querySnapshot.forEach((doc) => {
            batch.getBatch().delete(doc.ref);
        });
        await batch.commitAll();
    }
}
async function parseFile(filePath) {
    const extension = path_1.default.extname(filePath).toLowerCase();
    switch (extension) {
        case ".pdf":
            const dataBuffer = await fs_1.default.promises.readFile(filePath);
            const pdfData = await (0, pdf_parse_1.default)(dataBuffer);
            return pdfData.text;
        case ".docx":
            const result = await mammoth_1.default.extractRawText({ path: filePath });
            return result.value;
        case ".txt":
            return await fs_1.default.promises.readFile(filePath, "utf-8");
        default:
            throw new Error(`Unsupported file type: ${extension}`);
    }
}
async function indexToFirestore(data, filePath, label) {
    await Promise.all(data.map(async (text) => {
        const embedding = await (0, embedder_1.embed)({
            embedder: googleai_1.textEmbeddingGecko001,
            content: text,
        });
        await firebase_1.firestore.collection("neet_pg_2024_embeddings").add({
            embedding: firestore_1.FieldValue.vector(embedding),
            text: text,
            path: filePath,
            label: label,
        });
    }));
}
async function indexNEETPGData() {
    const docsPath = path_1.default.join(process.cwd(), "docs");
    const files = await listFiles(docsPath);
    console.log("Files to be indexed:", files);
    await Promise.all(files.map(async (file) => {
        const relativePath = path_1.default.relative(docsPath, file);
        const content = await parseFile(file);
        const label = relativePath;
        await checkAndDeletePath(relativePath);
        const chunks = (0, llm_chunk_1.chunk)(content, {
            minLength: 1000,
            splitter: "sentence",
        });
        await indexToFirestore(chunks, relativePath, label);
    }));
    console.log("NEET PG 2024 data indexing completed");
}
//# sourceMappingURL=indexing.js.map