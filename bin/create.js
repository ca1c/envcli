const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const getVars = require('./getVars.js');

function writeVars(envVars) {
        if(!envVars) {
            return;
        }

        if(envVars.length === 0) {
            return;
        }

        let contentBuffer = new Uint8Array(Buffer.from(envVars.join('')));
        fs.writeFile('.env', contentBuffer, (err) => {
            if(err) { reject(err);}
            console.log('.env file saved');
        })
}

async function varsInput(environmentVars) {
    let rawEnteredVars = [];
    let dataArr = [];
    for(const envVar of environmentVars) {
        if(envVar === '\n') {
            dataArr.push(envVar);
            continue;
        }
        
        if(!rawEnteredVars.includes(envVar)){
            await prompts({
                type: 'text',
                name: 'value',
                message: `set: ${chalk.green(envVar)}`,
                validate: (value) => {
                    dataArr.push(envVar + value);
                    rawEnteredVars.push(envVar);
                    return true;
                }
            })
        }
    }

    return dataArr;
}

async function create(argv) {
    if(!argv.file) {
      console.log(chalk.red('You need to enter a filename'));
      return 1;
    }
    if(fs.existsSync(argv.file) === false) {
      console.log(chalk.red(`The file, ${argv.file}, does not exist.`));
      return 1;
    }
    if(path.extname(argv.file) !== '.js') {
      console.log(chalk.red(`${argv.file} is not a javascript file`));
      return 1;
    }
    const environmentVars = await getVars(argv.file);
    const data = await varsInput(environmentVars);
    writeVars(data);
}

module.exports = create;