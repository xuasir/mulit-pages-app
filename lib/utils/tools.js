// -----功能模块------
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const gitClone = require('git-clone')
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const rm = require('rimraf').sync;
const template = require('art-template');
const metalsmith = require('metalsmith');
const shell = require('shelljs');

// 工具函数
// 通过init参数 返回创建根目录
/*
** 返回值为 false  表示无法完成创建
** 返回值为 appname 表示指直接在当前目录下创建appname文件夹
** 返回值为 '.' 表示直接在当前文件夹下操作
*/
function getRootPath(appName = '') {
  // 读取当前目录所有文件和文件夹
  let list = glob.sync('*');
  // 获取当前目录名
  let rootPath = path.basename(process.cwd())
  if(list.length) { // 当前不为空目录
    if(list.some(name => {
      if(name == appName) {
        const fullPath = path.resolve(process.cwd(), path.join('.', name));
        const isDir = fs.lstatSync(fullPath).isDirectory();
        // 冲突无法创建
        return isDir;
      }
      return false;
    })) {
      return false;
    }
    return appName; // 无冲突可在当前目录创建
  } else if(rootPath == appName) { // 当前目录与要创建目录名相等且当前目录为空直接返回 .
    return '.';
  } else { // 需要在当前目录创建目标文件夹
    return appName;
  }
}
// 下载git模板
function downloadRepo(url = '.') {
  let gitOrigin = 'https://github.com/xuguo-code/mulitpageappcli.git';
  let targetPath = path.join(url + '/', '.temp');
  return new Promise((resolve, reject) => {
    const spinner = ora('模板下载开始，请耐心等待...').start();
    gitClone(gitOrigin, targetPath, function(msg) {
      if(msg) {
        spinner.fail('模板下载失败');
        rm(targetPath);
        reject(msg);
      } else {
        spinner.succeed('模板下载成功');
        rm(targetPath+'/.git');
        resolve(targetPath);
      }
    });
  })
} 
// inquirer问答获取参数
function getAnswersConf(inquirerList = []) {
  return inquirer.prompt(inquirerList);
}
// 通过问答参数生成配置
function renderTempFile(data, src, dist) {
  let spinner = ora('正在生成配置文件中...').start();
  return new Promise((resolve, reject) => {
    metalsmith(process.cwd())
    .metadata(data)
    .source(src)
    .destination(dist)
    .clean(false)
    .use((files, metalsmith, done) => {
      const data = metalsmith.metadata();
      Object.keys(files).forEach(fileName => {
        const content = files[fileName].contents.toString();
        files[fileName].contents = Buffer.from(template.render(content, data))
      })
      done()
    })
    .build(err => {
      if(err) {
        spinner.fail('配置文件生成失败');
        reject(err);
      } else {
        spinner.succeed('配置生成成功');
        rm(src);
        resolve(true);
      }
    })
  });
}
// 移动文件 安装依赖
function mvFileAndInstall(targetPath, rootPath, answers) {
  return new Promise((resolve, reject) => {
    let spinner = ora('正在移动文件').start();
    shell.mv(targetPath+'/*', rootPath);
    shell.mv(targetPath+'/.babelrc', rootPath);
    shell.mv(targetPath+'/.gitignore', rootPath);
    rm(targetPath);
    shell.cd(rootPath);
    spinner.succeed('文件移动成功');
    console.info(chalk.grey('开始安装依赖并且生成Dll文件...'));
    shell.exec('npm i');
    shell.exec('npm run build:dll',
    function(code, stdout, stderr) {
      if(code != 0) {
        console.info(chalk.red('依赖生成失败'));
        reject(stderr);
      }
      console.info(chalk.green('依赖安装成功,Dll文件生成成功'));
      resolve(true);
    });
  });
}

// ----- common函数 ------
function awaitWrap(promiseFunc) {
  return promiseFunc&&promiseFunc.then(
    data => data
  ).catch(
    err => {
      console.error(chalk.red(`出现错误：${err}`));
      return null;
    }
  );
}

module.exports = { getRootPath,downloadRepo,getAnswersConf,awaitWrap,renderTempFile,mvFileAndInstall };