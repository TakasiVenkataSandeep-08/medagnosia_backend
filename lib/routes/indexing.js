"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const indexing_1 = require("../services/indexing");
const router = express_1.default.Router();
router.post("/indexDocs", async (req, res) => {
    try {
        await (0, indexing_1.indexNEETPGData)();
        res.status(200).json({ message: "NEET PG data indexed successfully" });
    }
    catch (error) {
        console.error("Error indexing NEET PG data:", error);
        res.status(500).json({ error: "Failed to index NEET PG data" });
    }
});
exports.default = router;
//# sourceMappingURL=indexing.js.map