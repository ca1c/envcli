#!/usr/bin/env node
const chalk = require('chalk');
const create = require('./main.js');
const usage = chalk.keyword('violet')("\nUsage: envcli <command> <argument>\n");

require('yargs')
  .scriptName("envcli")
  .usage(usage)
  // .option('d', {alias: "directory", describe: "Populate from files in Directory.", type: "string", demandOption: 'false'})
  .command('create [fdir]', chalk.hex('#4bc8db')('create .env file from directory or single javascript file'), (yargs) => {
    yargs.positional('fdir', {
      type: 'string',
      describe: 'file or directory to iterate through'
    })
  }, async function(argv) { await create(argv) })
  .help()
  .argv