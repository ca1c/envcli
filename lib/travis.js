const fs = require('fs');
const chalk = require('chalk');

const travis = function(directory, travDir) {
  return new Promise(function(resolve, reject) {
    if(fs.existsSync(directory + '.env') === true) {
      //Use existing file
      fs.readFile(directory + '.env', (err, data) => {
        if(err) reject(err);

        let envVarArr = data.toString().split('\n');

        let fileStringArr = ['\nenv:\n'];
        envVarArr.forEach((envVar) => {
          if(envVar === '') {
            //Do nothing
          }
          else {
            let varString = `\t - ${envVar}\n`;
            fileStringArr.push(varString);
          }

          if(envVarArr.indexOf(envVar) === envVarArr.length - 1) {
            if(fs.existsSync(travDir + '.travis.yml') === false) {
              fs.writeFileSync(travDir + '.travis.yml', "");

              let writeString = fileStringArr.join('');
              fs.readFile(travDir + '.travis.yml', (err, data1) => {
                let travFileString = data1.toString();
                let fullWriteString = travFileString + writeString;
                let travContentBuffer = new Uint8Array(Buffer.from(fullWriteString));
  
                fs.writeFile(directory + '.travis.yml', travContentBuffer, (err) => {
                  if(err) reject(err);
  
                  console.log(chalk.green('Your .travis.yml file has been saved.'));
                  resolve(writeString);
                })
              })
            }
            else {
              let writeString = fileStringArr.join('');
              fs.readFile(travDir + '.travis.yml', (err, data1) => {
                let travFileString = data1.toString();
                let fullWriteString = travFileString + writeString;
                let travContentBuffer = new Uint8Array(Buffer.from(fullWriteString));
  
                fs.writeFile(directory + '.travis.yml', travContentBuffer, (err) => {
                  if(err) reject(err);
  
                  console.log(chalk.green('Your .travis.yml file has been saved.'));
                  resolve(writeString);
                })
              })
            }
          }
        })
      })
    }
    else {
      reject('There is no .env file in the selected directory');
    }
  })
}

module.exports = travis;