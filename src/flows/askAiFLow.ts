import { defineFlow } from "@genkit-ai/flow";
import { generateStream } from "@genkit-ai/ai";
import { retrieve } from "@genkit-ai/ai/retriever";
import { gemini15Flash } from "@genkit-ai/googleai";
import { retrieverRef } from "../config/firebase";
import { systemPrompt } from "../utils/prompts";

type AskAIInput = {
  question: string;
  userHistory: any;
};

export const askAIFlow = defineFlow(
  {
    name: "askAIFlow",
  },
  async (input: AskAIInput) => {
    const { question, userHistory = [] } = input;

    if (!question) {
      throw new Error("Question is required");
    }

    const docs = await retrieve({
      retriever: retrieverRef,
      query: question,
      options: { limit: 7 },
    });

    const { stream } = await generateStream({
      model: gemini15Flash,
      prompt: question,
      context: docs,
      history: [systemPrompt, ...userHistory],
    });

    return stream;
  }
);
