const fs = require('fs');
const exec = require('child_process').exec;
const fetch = require('node-fetch');
const envVars = require('../.env_vars.json');
const pjson = require('../package.json');

function isLoading(bool) {
  if (bool) {
    consoleOut('⏳ ');
  }
}

async function isOutdated() {
  isLoading(true);
  const payload = envVars.PAYLOAD;
  const packet = {};
  packet.response = await fetch(payload)
      .then((res) => res.json())
      .catch((e) => {
        process.stdout.write(`\n😱 No internet connection available!
        Check for details below 👇\n`);
        process.stderr.write(`\n${JSON.stringify(e)}\n`);
        process.exit();
      });
  packet.current = await packet.response.version;
  packet.user = pjson.version;
  // eslint-disable-next-line   no-invalid-this
  if (packet.user !== packet.current) {
    packet.bool = true;
    return packet;
  } else {
    packet.bool = false;
    return packet;
  }
}

async function takeAction() {
  const packet = await isOutdated();
  if (!packet.bool) {
    consoleOut(`\n You are all set!
    Current version: ${packet.current} ✔ \n`);
  } else {
    consoleErr(`\n 😱 Found: ${packet.user} 
    ▶ Current: ${packet.current}`);
    upgradeLocal(packet.response);
  }
}

async function upgradeLocal(res) {
  await fs.writeFileSync('./package.json', JSON.stringify(res, null, '\t'));
  await npmi();
  await consoleOut('Done! 👍');
}

function npmi() {
  exec('npm i && npm i node-fetch', function(error, stdout, stderr) {
    // consoleOut('\nstdout: ' + stdout);
    // consoleOut('\nstderr: ' + stderr);
    if (error) {
      // consoleErr('exec error: ' + error);
      process.exit();
    }
  });
  consoleOut('\n Updating... 🎉\n');
}

const consoleErr = (arg) => process.stderr.write(arg);
const consoleOut = (arg) => process.stdout.write(arg);

exports.updateModules = {
  isOutdated: isOutdated,
  takeAction: takeAction,
};
