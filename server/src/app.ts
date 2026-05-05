import express from "express";
import morgan from "morgan";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./common/middlewares/errorHandler";
import { logger } from "./common/middlewares/logger";
import { rateLimiter } from "./common/middlewares/rateLimiter";

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3002",
      "http://localhost:3003",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));
app.use(logger);
app.use(rateLimiter);

// API Routes
app.use("/api/v1", routes);

// Error Handler
app.use(errorHandler);

export default app;
