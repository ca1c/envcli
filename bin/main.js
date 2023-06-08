const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const getVars = require('./getVars.js');
const helpers = require('./helpers.js');
const log = chalk.hex('#4bc8db');

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
        console.log(log('.env file saved'));
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

function getJSFilesInDir() {

}

function getDirsInDir() {
    
}

function recursiveDirectoryTraversion(dir, envVars) {
    
}

async function createFromFile(argv) {
    if(!argv.fdir) {
        console.log(chalk.red('You need to enter a filename'));
        return 1;
    }
    if(fs.existsSync(argv.fdir) === false) {
        console.log(chalk.red(`The file, ${argv.file}, does not exist.`));
        return 1;
    }
    if(path.extname(argv.fdir) !== '.js') {
        console.log(chalk.red(`${argv.fdir} is not a javascript file`));
        return 1;
    }
    const environmentVars = await getVars(argv.fdir);
    const data = await varsInput(environmentVars);
    writeVars(data);
}



async function createFromDirectory() {

}

async function create(argv) {
    if(helpers.isFile(argv.fdir)) {
        createFromFile(argv);
    }

    if(helpers.isDirectory(argv.fdir)) {
        //createFromDirectory
        createFromDirectory(argv);
    }

    // Can't find file or directory

}

module.exports = create;