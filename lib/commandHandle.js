const chalk = require('chalk');
// -----配置模块------
const {questionList} = require('./utils/baseConf');
// ----- 方法 -----
const tools = require('./utils/tools');
const awaitWrap = tools.awaitWrap;

// 指令功能函数---init
async function initHandle(appName='') {
  let rootPath = tools.getRootPath(appName);
  if(!rootPath) {
    console.error(chalk.red(`当前目录包含名为${appName}的文件夹，创建失败`));
    return ;
  }
  // 开始下载
  let targetPath = await awaitWrap(tools.downloadRepo(rootPath));
  if(!targetPath) return ;
  
  // 开始问答
  let nameQuestion = {
    name: 'name',
    message: `项目名称(${appName}):`,
    type: 'input',
    default: appName
  };
  let answers = await awaitWrap(tools.getAnswersConf([nameQuestion, ...questionList]));
  if(!answers) return ;

  // 生成配置文件
  let genConf = await awaitWrap(tools.renderTempFile(answers, targetPath + '/.templateFiles', targetPath));
  if(!genConf) return ;

  // 移动文件，安装依赖
  let succes = await awaitWrap(tools.mvFileAndInstall(targetPath, rootPath, answers));
  if(!succes) return ;
  let commandStr = '';
  if(rootPath == '.') {
    commandStr = `

    npm run dev

  `
  } else {
    commandStr = `

    cd ${rootPath}
    npm run dev

  `
  }
  console.info(chalk.green(commandStr))
  return ;
}

module.exports = { initHandle }