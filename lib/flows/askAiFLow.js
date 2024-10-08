"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askAIFlow = void 0;
const flow_1 = require("@genkit-ai/flow");
const ai_1 = require("@genkit-ai/ai");
const retriever_1 = require("@genkit-ai/ai/retriever");
const googleai_1 = require("@genkit-ai/googleai");
const firebase_1 = require("../config/firebase");
const prompts_1 = require("../utils/prompts");
exports.askAIFlow = (0, flow_1.defineFlow)({
    name: "askAIFlow",
}, async (input) => {
    const { question, userHistory = [] } = input;
    if (!question) {
        throw new Error("Question is required");
    }
    const docs = await (0, retriever_1.retrieve)({
        retriever: firebase_1.retrieverRef,
        query: question,
        options: { limit: 7 },
    });
    const { stream } = await (0, ai_1.generateStream)({
        model: googleai_1.gemini15Flash,
        prompt: question,
        context: docs,
        history: [prompts_1.systemPrompt, ...userHistory],
    });
    return stream;
});
//# sourceMappingURL=askAiFLow.js.map