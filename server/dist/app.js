import express from "express";
import morgan from "morgan";
import routes from "./routes/index.js";
import { errorHandler } from "./common/middlewares/errorHandler.js";
import { logger } from "./common/middlewares/logger.js";
import { rateLimiter } from "./common/middlewares/rateLimiter.js";
const app = express();
// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(logger);
app.use(rateLimiter);
// API Routes
app.use("/api/v1", routes);
// Error Handler
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map