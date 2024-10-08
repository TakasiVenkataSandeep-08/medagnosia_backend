import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import counselingRoutes from "./routes/counseling";
import indexingRoutes from "./routes/indexing";

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use("/api", counselingRoutes);
app.use("/api", indexingRoutes);
const PORT = process.env.PORT || 3000;

function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(
        `NEET PG 2024 Counseling Assistant is running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();
