const winston = require('winston');
const utils = require('./utils');
const enums = require('./enums');
const config = require('./config/config');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
  ],
});

if (config.environment === enums.environmentVariables.PRODUCTION) {
  logger.add(new winston.transports.File({ filename: 'error.log', level: 'error' }));
  logger.add(new winston.transports.File({ filename: 'combined.log' }));
} else {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
