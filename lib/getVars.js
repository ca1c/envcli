  
const fs = require('fs');

let envVariables = [];

const getVars = function(file) {
  return new Promise(function(resolve, reject) {
    fs.readFile(file, (err, data) => {
      if(err) { reject(err); };
      
      let words = data.toString().split('\n').join(' ').split(' ');

      for(let i = 0; i < words.length; i++) {
        if(words[i].includes('process.env')) {
          let thirds = words[i].split('.');
          let envVar = thirds[thirds.length - 1];

          envVariables.push(envVar.replace(/[^\w]/g, ''));
        }
        if(i === words.length - 1) {
          let newArr = [];

          for(let a = 0; a < envVariables.length; a++) {
            newArr.push(envVariables[a] + "=");
            newArr.push("\n");

            if(a === envVariables.length - 1) {
              let contentBuffer = new Uint8Array(Buffer.from(newArr.join('')));

              fs.writeFile('.env', contentBuffer, (err) => {
                if(err) { reject(err);}
                resolve(newArr);
              })
            }
          }
        }
      }
    })
  })
}
module.exports = getVars;