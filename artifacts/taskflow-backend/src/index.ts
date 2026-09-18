import app from "./app";
import { logger } from "./lib/logger";
import { config } from "./config/env";

app.listen(config.port, config.host, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info(
    { host: config.host, port: config.port },
    `Server listening on ${config.host}:${config.port}`,
  );
});
