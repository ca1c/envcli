#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const chalk = require('chalk');
const getVars = require('../lib/getVars.js');
const gitignoreCommand = require('../lib/gitignore.js');
const travis = require('../lib/travis.js');

require('yargs')
  .scriptName("gk")
  .usage('$0 <cmd> [args]')
  .command('create [file]', 'main function', (yargs) => {
    yargs.positional('file', {
      type: 'string',
      describe: 'file to iterate through'
    })
  }, function(argv) {
    if(!argv.file) {
      console.log(chalk.red('You need to enter a filename'));
      return 1;
    }
    else if(fs.existsSync(argv.file) === false) {
      console.log(chalk.red(`The file, ${argv.file}, does not exist.`));
      return 1;
    }
    else if(path.extname(argv.file) !== '.js') {
      console.log(chalk.red(`${argv.file} is not a javascript file`));
      return 1;
    }
    else {
      getVars(argv.file).then((environmentVars) => {
        let rawEnteredVars = [];
        let dataArr = [];
        (async () => {
          for(let k = 0; k < environmentVars.length; k++) {
            if(environmentVars[k] === '\n') {
              dataArr.push(environmentVars[k]);
            }
            else if(rawEnteredVars.includes(environmentVars[k]) === false){
              const response = await prompts({
                type: 'text',
                name: 'value',
                message: `set: ${chalk.green(environmentVars[k])}`,
                validate: (value) => {
                  dataArr.push(environmentVars[k] + value);
                  rawEnteredVars.push(environmentVars[k]);
                  return true;
                }
              })
            }
            else {
              //environment variable already exists
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
      }).catch((err) => {
        console.log(err);
      })
    }
  })
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
  .command('gitignore [dir]', 'adds existing .env to existing or nonexistent .gitignore file', (yargs) => {
    // Nothing because no args
  }, function(argv) {
    let directory;
    if(!argv.dir) {
      directory = '';
    }
    else if(argv.dir === '/') {
      directory = '';
    }
    else {
      directory = argv.dir;
    }
    gitignoreCommand(directory).then((buffer) => {
      console.log(`File buffer: ${buffer}`);
    }).catch((err) => {
      console.log(chalk.red(err));
    });
  })
  .command('createRev [file] [dir] [filename]', 'turns .env variables into javascript references of them', (yargs) => {
    yargs.positional('file', {
      type: 'string',
      describe: '.env file'
    })
    yargs.positional('dir', {
      type: 'string',
      describe: 'the directory to place the new javascript file in'
    })
    yargs.positional('filename', {
      type: 'string',
      describe: 'the name of the new javascript file'
    })
  }, function(argv) {
    if(!argv.file) {
      console.log(chalk.red('You need to enter a .env file.'))
    }
    else if(!argv.dir){
      console.log(chalk.red('You need to enter a directory to place the new javascript file.'))
    }
    else if(!argv.filename) {
      console.log(chalk.red('You need to enter a filename for the new javascript file.'))
    }
    else {
      fs.readFile(argv.file, (err, data) => {
        let vars = data.toString().split('\n');
        let jsVars = [];
        vars.forEach((singVar) => {
          let varName = singVar.split('=').splice(this.length - 1, 1);
          jsVars.push(varName);

          //Loop finished
          if(vars.indexOf(singVar) === vars.length - 1) {
            function arrayWorking() {
              //.env file may have had blank lines, this creates empty strings in the jsVars array
              if(jsVars.includes('') === true) {
                jsVars.forEach((item) => {
                  if(item === '') {
                    jsVars = jsVars.splice(jsVars.indexOf(item), 1);
                  }
                  else {
                    //Do not remove item it is not an empty string
                  }

                  if(jsVars.indexOf(item) === jsVars.length - 1) {
                    arrayWorking();
                  }
                })
              }
              else {
                let newArr = [];
                jsVars.forEach((item) => {
                  if(item[0] === '') {
                    //do nothing
                  }
                  else {
                    newItem = `let ${item[0].toLowerCase()} = process.env.${item[0]}`;
                    newArr.push(newItem);
                  }

                  if(jsVars.indexOf(item) === jsVars.length - 1) {
                    let buffString = newArr.join('\n');
                    const data = new Uint8Array(Buffer.from(buffString));

                    if (fs.existsSync(argv.dir) === true) {
                      fs.writeFile(argv.dir + '/' + argv.filename, data, (err) => {
                        if(err) throw err;
                        console.log(chalk.green(`Your ${argv.filename} file has been saved to the directory ${argv.dir}`));
                      }) 
                    }
                    else {
                      //Create new directory
                      fs.mkdir(argv.dir, (err) => {
                        if(err) throw err;
                        fs.writeFile(argv.dir + '/' + argv.filename, data, (err) => {
                          if(err) throw err;
                          console.log(chalk.green(`Your ${argv.filename} file has been saved to the directory ${argv.dir}`));
                        })
                      })
                    }
                  }
                })
              }
            }
            arrayWorking();
          }
        })
      })
    }
  })
  .command('travis [dir] [travDir]', 'Lets the user add specific environment variables to existing or nonexistent .travis.yml file', (yargs) => {
    yargs.positional('dir', {
      type: 'string',
      describe: 'directory of .env file'
    })
    yargs.positional('travDir', {
      type: 'string',
      describe: 'directory to place .travis.yml file or where existing .travis.yml file is located'
    })
  }, function(argv) {
    let directory;
    let travDir;
    if(!argv.dir) {
      directory = '';
    } 
    else if(argv.dir === '/') {
      directory = '';
    }

    if(!argv.travDir) {
      travDir = '';
    }
    else if(argv.travDir === '/') {
      travDir = '';
    }

    if(argv.dir && argv.travDir) {
      directory = argv.dir;
      travDir = argv.travDir;
    }

    //Main code
    travis(directory, travDir).then(() => {

    }).catch((err) => {
      console.log(chalk.red(err));
    })

  })
  .help()
  .argv