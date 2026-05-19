import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { authenticateJWT } from "./common/middlewares/auth";
import requireTenant from "./common/middlewares/requireTenant";
import { errorHandler } from "./common/middlewares/errorHandler";
import { logger } from "./common/middlewares/logger";
import { globalRateLimiter } from "./common/middlewares/rateLimiter";
import {
  sanitizeHeaders,
  securityHeaders,
  validateJsonPayload,
} from "./common/middlewares/security";
import authRouter from "./modules/auth/auth.routes";
import tenantRouter from "./modules/tenant/tenant.routes";
import scsAuthRouter from "./modules/scs-auth/scs-auth.routes";
import scsAdminRouter from "./modules/scs-admin/scs-admin.routes";
import { config } from "./common/config";

const app = express();

// SECURITY: Helmet middleware for security headers
app.use(helmet());

// SECURITY: Additional security headers
app.use(securityHeaders);

// SECURITY: Sanitize request headers
app.use(sanitizeHeaders);

const allowedOrigins = config.corsOrigins;

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// SECURITY: Validate and sanitize JSON payloads
app.use(express.json());
app.use(validateJsonPayload);

app.use(morgan("dev"));
app.use(logger);

// SECURITY: Global rate limiting
app.use(globalRateLimiter);

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
