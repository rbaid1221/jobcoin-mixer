const _ = require('lodash');
const enums = require('../enums');
const dev = require('./config.dev');
const prod = require('./config.prod');

const getEnvironmentVariable = () => {
  const envVariable = process.env.NODE_ENV;
  if (envVariable === 'production') {
    return enums.environmentVariables.PRODUCTION;
  }
  return enums.environmentVariables.DEVELOPMENT;
};

// Default configuration variables that are shared between both dev and prod environments
// also sets a basis for environment variables that both should have.
let config = {
  apis: {
    jobClient: {
      apiBaseUrl: 'http://jobcoin.gemini.com/county-kindred/api',
    },
  },
  houseAccount: 'house-account',
  polling: {
    timeout: 1000,
    tries: 1000,
    factor: 1, // this creates an exponential factor to delay the polling timeout
  },
  doler: {
    smallestAmount: 0.05,
  },
  decimalPlaces: 8, // using 8 because individual btc is divisible upto 8 decimal places
  environment: getEnvironmentVariable(),
};

if (config.environment === enums.environmentVariables.PRODUCTION) {
  config = _.merge(config, prod);
} else {
  config = _.merge(config, dev);
}

module.exports = config;
