const fs = require('fs').promises;

async function isFile(input) {
    const stat = await fs.lstat(input);

    return stat.isFile();
}

async function isDirectory(input) {
    const stat = await fs.lstat(input);

    return stat.isDirectory();
}

async function exists(input) {
    try {
        await access(input, constants.R_OK | constants.W_OK);
        return true;
    } catch {
        return false;
    } 
}

module.exports = {
    isFile: isFile,
    isDirectory: isDirectory,
    exists: exists
};