import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { authenticateJWT } from "./common/middlewares/auth";
import requireTenant from "./common/middlewares/requireTenant";
import { errorHandler } from "./common/middlewares/errorHandler";
import { logger } from "./common/middlewares/logger";
import { globalRateLimiter } from "./common/middlewares/rateLimiter";
import {
  sanitizeRequest,
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

// Public health endpoint (used by platforms like Render for health checks)
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// SECURITY: Helmet middleware for security headers
app.use(helmet());

// PERFORMANCE: Gzip/Brotli compress all responses
app.use(compression());

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

// SECURITY: Parse cookies for HttpOnly auth tokens
app.use(cookieParser());

// SECURITY: Validate and sanitize JSON payloads
app.use(express.json({ limit: "10mb", strict: true }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(sanitizeRequest);
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
