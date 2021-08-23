#!/usr/bin/env node

const { green } = require('chalk');
const inquirer = require('inquirer');
const logger = require('./common/logger');
const { validateAddresses } = require('./common/validators');
const mixer = require('./services/mixer');

const mixerClient = mixer();

const depositMessageAndBeginPolling = async (answers) => {
  const { addresses } = answers;
  const depositAddress = await mixerClient.generateNewDepositAddress();
  mixerClient.startMixing(addresses, depositAddress);
  return `You may now send Jobcoins to address ${green(depositAddress)}. They will be mixed and sent to your destination addresses. \n Enter ${green('"y"')} to run again.`;
};

function prompt() {
  /* Inquirer documentation: https://github.com/SBoudrias/Inquirer.js#documentation */
  inquirer.prompt([
    {
      name: 'addresses',
      message: 'Please enter a comma-separated list of new, unused Jobcoin addresses where your mixed Jobcoins will be sent:',
      validate: validateAddresses,
    },
    {
      name: 'deposit',
      message: depositMessageAndBeginPolling,
      when: (answers) => answers.addresses,
    },
  ])
    .then(async (answers) => {
      if (answers.deposit && answers.deposit.toLowerCase() === 'y') {
        prompt();
      }
    }).catch((error) => {
      logger.error(`There was an error processing your request with error message: ${error}`);
    });
}

prompt();

module.exports = prompt;
