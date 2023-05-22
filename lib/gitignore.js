const fs = require('fs');
const chalk = require('chalk');

const gitignoreCommand = function(dir) {
  return new Promise(function(resolve, reject) {
    this.dir = dir;

    if(fs.existsSync(this.dir + '/' + '.gitignore')) {
      fs.readFile(this.dir + '/' +'.gitignore', (err, data) => {
        if (err) reject(err);
        let stringArr = data.toString().split('\n');
    
        if(stringArr.includes('.env')) {
          console.log(chalk.red('Your gitignore already has your .env file mentioned.'))
          reject('Your gititgnore already has your .env file mentioned.');
        }
        else {
          stringArr.push('\n');
          stringArr.push('.env');
          stringArr.join('\n');
          let testString = '\n.env\n';
          let stringToWrite = stringArr.join('\n');
          let contentBuffer = Buffer.from(stringArr.join('\n'));
          let bufferArray = new Uint8Array(contentBuffer);
    
          fs.writeFile(this.dir + '/' + '.gitignore', bufferArray, (err) => {
            if(err) reject(err);
            
            console.log(chalk.green('Your .gitignore file has been saved.'));
            resolve(testString);
          })
        }
      })
    }
    else {
      let stringToWrite = "\n.env\n";
      let contentBuffer = Buffer.from(stringToWrite);
      let bufferArray = new Uint8Array(contentBuffer);
    
      fs.writeFile(this.dir + '/' +'.gitignore', bufferArray, (err) => {
        if(err) reject(err);
    
        console.log(chalk.green('Your .gitignore file has been saved.'));
        resolve(stringToWrite);
      })
    }
  });
}

module.exports = gitignoreCommand;