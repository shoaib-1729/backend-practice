const { createLogger, transports, format } = require("winston");

const logger = createLogger({
  level: "info", // default level (error < warn < info < http < verbose < debug < silly)
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.colorize(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(), // log to console
    new transports.File({ filename: "logs/error.log", level: "error" }), // only errors
    new transports.File({ filename: "logs/combined.log" }) // all logs
  ],
});

module.exports = logger;