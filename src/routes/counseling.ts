import express from "express";
import { askAIFlow } from "../flows/askAiFLow";
import { runFlow } from "@genkit-ai/flow";

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

router.post("/askAI", async (req, res) => {
  try {
    const { question = "", userHistory = [] } = req.body;

    // Set headers for streaming
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    const stream = await runFlow(askAIFlow, { question, userHistory });
    // Stream the response
    for await (const chunk of stream()) {
      if (res.writableEnded) break;
      const responseChunk = chunk;
      const chunkText = responseChunk.content[0].text;
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
