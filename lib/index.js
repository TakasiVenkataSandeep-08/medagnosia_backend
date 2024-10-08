"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const counseling_1 = __importDefault(require("./routes/counseling"));
const indexing_1 = __importDefault(require("./routes/indexing"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use("/api", counseling_1.default);
app.use("/api", indexing_1.default);
const PORT = process.env.PORT || 3000;
function startServer() {
    try {
        app.listen(PORT, () => {
            console.log(`NEET PG 2024 Counseling Assistant is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
    }
}
startServer();
//# sourceMappingURL=index.js.map