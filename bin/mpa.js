#! /usr/bin/env node
const program = require('commander');

// 注册init指令
program.version(require('../package').version)
  .usage('<command> [项目名称]')
  .command('init', '创建新的多页面应用基本配置')
  .parse(process.argv)
