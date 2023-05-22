const test = require('ava');
const fs = require('fs');
const getVars = require('../lib/getVars.js');
const gitignoreCommand = require('../lib/gitignore.js');
const travis = require('../lib/travisTest.js');

test('resolves with array of environment vars', t => {
  const writeString = "const user = process.env.USER;\nconst pass = process.env.PASS;\nconst secret = process.env.SECRET;"
  fs.writeFile('testDir/environmentVars.js', writeString, function(err) {
    if(err) throw err;
  })

  const file = 'testDir/environmentVars.js';
  return getVars(file).then((environmentVariables) => {
    t.deepEqual(environmentVariables, ['USER=', '\n', 'PASS=', '\n', 'SECRET=', '\n']);
  })
})

test('resolves with the string of a file content buffer', t => {
  const writeString = "";
  fs.writeFile('testDir/.gitignore', writeString, function(err) {
    if(err) throw err;
  })

  return gitignoreCommand('testDir').then((bufferString) => {
    // bufferString = buffer.toString();
    t.is(bufferString, '\n.env\n');
  })
})

test('resolves with a string of environment variables', t => {
  fs.writeFileSync("testDir/.travis.yml", "");

  return travis("testDir/", "testDir/").then((fileWriteString) => {
    let compareString = "\nenv:\n\t - USER=talonbragg\n\t - PASS=password\n\t - SECRET=s3cr3t\n";
    t.is(fileWriteString, compareString);
  })
})