import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base format for both file and console transports
const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`
  )
);

const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, "..", "logs", "app.log"),
      format: baseFormat,
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // colorize only for console
        baseFormat // Use base format
      ),
    }),
  ],
});

export default logger;