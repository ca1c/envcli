const fs = require('fs').promises;

async function isFile(input) {
    const stat = await fs.lstat(input);

    return stat.isFile();
}

async function isDirectory(input) {
    const stat = await fs.lstat(input);

    return stat.isDirectory();
}

module.exports = {
    isFile: isFile,
    isDirectory: isDirectory
};