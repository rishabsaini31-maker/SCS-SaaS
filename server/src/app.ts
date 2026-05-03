import express from "express";
import morgan from "morgan";
import { json } from "express";
import { errorHandler } from "./common/middlewares/errorHandler";
import { logger } from "./common/middlewares/logger";
import routes from "./routes";

const app = express();

app.use(json());
app.use(morgan("dev"));
app.use(logger);

app.use("/api/v1", routes);

app.use(errorHandler);

export default app;
