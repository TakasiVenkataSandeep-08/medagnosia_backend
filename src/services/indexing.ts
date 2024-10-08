import { embed } from "@genkit-ai/ai/embedder";
import { chunk } from "llm-chunk";
import { readdir } from "fs/promises";
import path from "path";
import { firestore } from "../config/firebase";
import { textEmbeddingGecko001 } from "@genkit-ai/googleai";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import fs from "fs";
import { FieldValue } from "firebase-admin/firestore";
import { BatchWriter } from "../utils/BatchWriter";

async function listFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const res = path.resolve(dir, entry.name);
      return entry.isDirectory() ? listFiles(res) : res;
    })
  );
  return files.flat();
}

async function checkAndDeletePath(filePath: string) {
  const collectionRef = firestore.collection("neet_pg_2024_embeddings");
  const querySnapshot = await collectionRef.where("path", "==", filePath).get();

  if (!querySnapshot.empty) {
    console.log(`Deleting existing documents for ${filePath}`);
    const batch = new BatchWriter(100, firestore);
    querySnapshot.forEach((doc) => {
      batch.getBatch().delete(doc.ref);
    });
    await batch.commitAll();
  }
}

async function parseFile(filePath: string): Promise<string> {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".pdf":
      const dataBuffer = await fs.promises.readFile(filePath);
      const pdfData = await pdf(dataBuffer);
      return pdfData.text;

    case ".docx":
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;

    case ".txt":
      return await fs.promises.readFile(filePath, "utf-8");

    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

async function indexToFirestore(
  data: string[],
  filePath: string,
  label: string
) {
  await Promise.all(
    data.map(async (text) => {
      const embedding = await embed({
        embedder: textEmbeddingGecko001,
        content: text,
      });

      await firestore.collection("neet_pg_2024_embeddings").add({
        embedding: FieldValue.vector(embedding),
        text: text,
        path: filePath,
        label: label,
      });
    })
  );
}

export async function indexNEETPGData() {
  const docsPath = path.join(process.cwd(), "docs");
  const files = await listFiles(docsPath);

  console.log("Files to be indexed:", files);

  await Promise.all(
    files.map(async (file) => {
      const relativePath = path.relative(docsPath, file);
      const content = await parseFile(file);
      const label = relativePath;

      await checkAndDeletePath(relativePath);

      const chunks = chunk(content, {
        minLength: 1000,
        splitter: "sentence",
      });
      await indexToFirestore(chunks, relativePath, label);
    })
  );

  console.log("NEET PG 2024 data indexing completed");
}
