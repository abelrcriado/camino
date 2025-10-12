import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

// Determinar si estamos en producción
const isProduction = process.env.NODE_ENV === "production";

// Formato para desarrollo (legible)
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    ({ timestamp, level, message, correlationId, ...meta }) => {
      const metaString = Object.keys(meta).length
        ? JSON.stringify(meta, null, 2)
        : "";
      const corrId = correlationId ? `[${correlationId}]` : "";
      return `${timestamp} ${level} ${corrId}: ${message} ${metaString}`;
    }
  )
);

// Formato para producción (JSON estructurado)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Transports (destinos de logs)
const transports: winston.transport[] = [
  // Consola - siempre activa
  new winston.transports.Console({
    format: isProduction ? prodFormat : devFormat,
  }),
];

// Agregar archivos con rotación (en desarrollo y producción)
// Archivo para todos los logs
transports.push(
  new DailyRotateFile({
    filename: path.join("logs", "combined-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxFiles: "14d", // Mantener 14 días
    maxSize: "20m", // Rotar si supera 20MB
    format: isProduction ? prodFormat : devFormat,
  })
);

// Archivo solo para errores
transports.push(
  new DailyRotateFile({
    filename: path.join("logs", "errors-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    level: "error",
    maxFiles: "30d", // Mantener 30 días para errores
    maxSize: "20m",
    format: isProduction ? prodFormat : devFormat,
  })
);

// Crear el logger
export const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: prodFormat,
  transports,
  // Prevenir que Winston maneje excepciones no capturadas
  exceptionHandlers: isProduction
    ? [
        new DailyRotateFile({
          filename: path.join("logs", "exceptions-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          maxFiles: "30d",
        }),
      ]
    : undefined,
  rejectionHandlers: isProduction
    ? [
        new DailyRotateFile({
          filename: path.join("logs", "rejections-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          maxFiles: "30d",
        }),
      ]
    : undefined,
});

// Log de inicio
logger.info("Logger initialized", {
  environment: process.env.NODE_ENV || "development",
  level: logger.level,
});

export default logger;
