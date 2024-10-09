import express from "express";
import { validateFirebaseToken } from "../middlewares/firebaseTokenValidator";
import { generateStream } from "@genkit-ai/ai";
import { retrieve } from "@genkit-ai/ai/retriever";
import { gemini15Pro } from "@genkit-ai/googleai";
import { retrieverRef } from "../config/firebase";
import { systemPrompt } from "../utils/prompts";
const router = express.Router();

router.post("/stream-data", async (req, res) => {
  // Simulating a data stream
  const streamData = async function* () {
    for (let i = 0; i < 5; i++) {
      yield `Chunk ${i + 1}\n`;
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate delay
    }
  };

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Transfer-Encoding", "chunked"); // Enable chunked transfer encoding
  for await (const chunk of streamData()) {
    console.log(chunk);
    res.write(chunk);
  }
  res.end();
});

router.post("/askAI", validateFirebaseToken, async (req, res) => {
  try {
    const { question = "", userHistory = [] } = req.body;

    // Set headers for streaming
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    const docs = await retrieve({
      retriever: retrieverRef,
      query: question,
      options: { limit: 7 },
    });

    const { stream } = await generateStream({
      model: gemini15Pro,
      prompt: question,
      context: docs,
      history: [systemPrompt, ...userHistory],
      output: { format: "text" },
    });
    // Stream the response
    for await (const chunk of stream()) {
      if (res.writableEnded) break;
      const responseChunk = chunk;
      const chunkText = responseChunk?.content[0]?.text;
      if (chunkText) {
        res.write(chunkText);
      }
    }
    res.end();
  } catch (error) {
    console.error("Error:", error);
    if (!res.headersSent) {
      res.status(500).send("An error occurred");
    } else {
      res.end("\nAn error occurred while processing the request.");
    }
  }
});

export default router;
