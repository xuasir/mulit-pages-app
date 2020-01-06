const program = require('commander');
const { initHandle } = require('../lib/commandHandle');

program.usage('<app-name>').parse(process.argv);

let appName = program.args[0];

if(!appName) {
  program.help();
  return ;
}

initHandle(appName);