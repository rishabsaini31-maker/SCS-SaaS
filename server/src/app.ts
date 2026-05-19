import express from "express";
import morgan from "morgan";
import cors from "cors";
import routes from "./routes";
import { authenticateJWT } from "./common/middlewares/auth";
import requireTenant from "./common/middlewares/requireTenant";
import { errorHandler } from "./common/middlewares/errorHandler";
import { logger } from "./common/middlewares/logger";
import { rateLimiter } from "./common/middlewares/rateLimiter";
import authRouter from "./modules/auth/auth.routes";
import tenantRouter from "./modules/tenant/tenant.routes";
import scsAuthRouter from "./modules/scs-auth/scs-auth.routes";
import scsAdminRouter from "./modules/scs-admin/scs-admin.routes";

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
app.use(authenticateJWT);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/tenants", tenantRouter);
app.use("/api/v1/scs-admin", scsAuthRouter);
app.use("/api/v1/scs-admin", scsAdminRouter);

app.use(requireTenant);

// API Routes
app.use("/api/v1", routes);

// Error Handler
app.use(errorHandler);

export default app;
