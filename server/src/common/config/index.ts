import dotenv from "dotenv";
dotenv.config();

export const config: {
  port: string | number;
  nodeEnv: string;
  jwtSecret: string;
} = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "CHANGE_ME_IN_PRODUCTION",
};
