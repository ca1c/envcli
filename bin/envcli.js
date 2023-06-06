#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const chalk = require('chalk');
const create = require('./create.js');
const gitignoreCommand = require('../lib/gitignore.js');
const travis = require('../lib/travis.js');

const yargs = require('yargs');

const usage = chalk.keyword('violet')("\nUsage: envcli <command> <argument>\n");

require('yargs')
  .scriptName("envcli")
  .usage(usage)
  // .option('d', {alias: "directory", describe: "Populate from files in Directory.", type: "string", demandOption: 'false'})
  .command('create [file]', 'main function', (yargs) => {
    yargs.positional('file', {
      type: 'string',
      describe: 'file to iterate through'
    })
  }, function(argv) { create(argv) })
  .command('createDir [directory]', 'execute main function for all js files in a directory', (yargs) => {
    yargs.positional('directory', {
      type: 'string',
      describe: 'directory to iterate through'
    })
  }, function(argv) {
    let finishedBool = false;
    if(!argv.directory) {
      console.log(chalk.red('You need to enter a directory'));
      return;
    }
    else if(fs.existsSync(argv.directory) === false) {
      console.log(chalk.red('That is not a directory!'));
    }
    else {
      function filewalker(dir, done) {
        let results = [];
        fs.readdir(dir, function(err, list) {
          if (err) return done(err);
  
          var pending = list.length;
  
          if (!pending) {
            finishedBool = true;
            return done(null, results);
          }
  
          list.forEach(function(file){
            file = path.resolve(dir, file);

            fs.stat(file, function(err, stat){
              // If directory, execute a recursive call
              if (stat && stat.isDirectory()) {
                // Add directory to array [comment if you need to remove the directories from the array]

                filewalker(file, function(err, res){
                  results = results.concat(res);
                  if (!--pending) done(null, results);
                });
              } else {
                results.push(file);

                if (!--pending) {
                  done(null, results);
                }
              }
            });
          });
        });
      }
      filewalker(argv.directory, (err, data) => {
        if(err) {
          throw err;
        }

        data.forEach((file) => {
          let duoArr = file.split(argv.directory);

          if(path.extname(duoArr[1]) !== '.js') {
            console.log('not javascript file');
            return;
          }
          getVars(argv.directory + duoArr[1]).then((environmentVars) => {
            let rawEnteredVars = [];
            let dataArr = [];
            if(data.indexOf(file) === data.length - 1){
              (async () => {
                for(let k = 0; k < environmentVars.length; k++) {
                  if(environmentVars[k] === '\n') {
                    dataArr.push(environmentVars[k]);
                  }
                  else if(rawEnteredVars.includes(environmentVars[k]) === false) {
                    // console.log(dataArr.includes(environmentVars[k]), environmentVars[k], environmentVars);
                    const response = await prompts({
                      type: 'text',
                      name: 'value',
                      message: `set: ${chalk.green(environmentVars[k])}`,
                      validate: (value) => {
                        rawEnteredVars.push(environmentVars[k]);
                        dataArr.push(environmentVars[k] + value);
                        return true;
                      }
                    })
                  }
                  else {
                    //environment variable already defined
                  }
                  if(k === environmentVars.length - 1) {
                    let contentBuffer = new Uint8Array(Buffer.from(dataArr.join('')));
                    fs.writeFile('.env', contentBuffer, (err) => {
                      if(err) { reject(err);}
                      console.log('.env file saved');
                    })
                  }
                }
              })();
            }
          }).catch((err) => {
            console.log(err);
          })
        })
      })
    }
  })
  .help()
  .argv