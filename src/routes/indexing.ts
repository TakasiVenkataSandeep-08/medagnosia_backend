import express from "express";
import { indexNEETPGData } from "../services/indexing";

const router = express.Router();

router.post("/indexDocs", async (req, res) => {
  try {
    await indexNEETPGData();
    res.status(200).json({ message: "NEET PG data indexed successfully" });
  } catch (error) {
    console.error("Error indexing NEET PG data:", error);
    res.status(500).json({ error: "Failed to index NEET PG data" });
  }
});

export default router;
