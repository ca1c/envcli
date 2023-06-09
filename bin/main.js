const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');
const prompts = require('prompts');
const helpers = require('./helpers.js');
const log = chalk.hex('#4bc8db');

async function getVars(file) {
    const data = await fs.readFile(file);
    
    const words = data.toString().split('\n').join(' ').split(' ');
    
    const filteredWords = words.filter(word => word.includes('process.env.'));

    const envVars = filteredWords.map(word => word.split('.')[2].replace(/[^\w]/g, ''));

    

    let varArr = [];

    for(const envVar of envVars) {
      varArr.push(envVar + "=");
      varArr.push("\n");
    }
      
    return varArr;
}

async function writeVars(envVars) {
    if(!envVars) {
        console.log(log('no env vars'));
        return;
    }

    if(envVars.length === 0) {
        console.log(log('env vars empty'));
        return;
    }

    let contentBuffer = new Uint8Array(Buffer.from(envVars.join('')));
    await fs.writeFile('.env', contentBuffer, (err) => {
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

async function readDirectory(dir) {
    try {
        return await fs.readdir(dir);
    }
    catch(error) {
        console.log(error);
    }
}

async function getJSFilesInDir(dirList, dir) {
    
    const jsFiles = [];


    for(const item of dirList) {
        const fullPath = path.join(dir, item);

        if(await helpers.isFile(fullPath) && path.extname(fullPath) === '.js') {
            jsFiles.push(path.normalize(fullPath));
        }
    }

    return jsFiles;
}

async function getDirsInDir(dirList, dir) {
    const dirs = [];

    for(const item of dirList) {
        const fullPath = path.join(dir, item);
        if(await helpers.isDirectory(fullPath)) {
            dirs.push(path.normalize(fullPath));
        }
    }

    return dirs;
}

// returns all js files in all sub-directories
async function recursiveDirectoryTraversion(dir, jsFiles = []) {
    const dirList = await readDirectory(dir);
    const getJSFiles = await getJSFilesInDir(dirList, dir);
    const nextJSFiles = jsFiles.concat(getJSFiles);
    const directories = await getDirsInDir(await readDirectory(dir), dir);

    if(directories.length === 0) {
        return nextJSFiles;
    }

    for(const directory of directories) {
        return recursiveDirectoryTraversion(directory, nextJSFiles);
    }
}

async function createFromFile(argv) {
    if(path.extname(argv.fdir) !== '.js') {
        console.log(chalk.red(`${argv.fdir} is not a javascript file`));
        return 1;
    }

    const environmentVars = await getVars(argv.fdir);
    const data = await varsInput(environmentVars);
    writeVars(data);
}

async function createFromDirectory(argv) {
    const jsFiles = await recursiveDirectoryTraversion(argv.fdir, []);
    let environmentVars = [];
    for(const file of jsFiles) {
        const envVars = await getVars(file);
        environmentVars = environmentVars.concat(envVars);
    }

    const data = await varsInput(environmentVars);
    writeVars(data);
}

async function create(argv) {
    if(!argv.fdir) {
        console.log(chalk.red('Please enter a directory or file name.'));
        return 1;
    }

    if(!helpers.exists(argv.fdir)) {
        console.log(chalk.red(`The file or directory, ${argv.fdir}, does not exist.`));
        return 1;
    }

    if(await helpers.isFile(argv.fdir)) {
        createFromFile(argv);
    }

    if(await helpers.isDirectory(argv.fdir)) {
        await createFromDirectory(argv);
    }
}

module.exports = create;