const { createLogger, format, transports } = require("winston");
const config = require("../config");

const logger = createLogger({
  level: config.log.level,
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    config.nodeEnv === "production"
      ? format.json()
      : format.combine(
          format.colorize(),
          format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length
              ? "\n" + JSON.stringify(meta, null, 2)
              : "";
            return `${timestamp} [${level}] ${message}${metaStr}`;
          })
        )
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
