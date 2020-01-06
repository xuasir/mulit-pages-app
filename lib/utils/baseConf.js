module.exports = {
  questionList: [
    {
      name: 'version',
      message: '项目版本号:',
      type: 'input',
      default: '1.0.0'
    },
    {
      name: 'description',
      message: '项目描述:',
      type: 'input',
      default: '这是一个多页面项目'
    },
    {
      name: 'author',
      message: '作者',
      type: 'input'
    },
    {
      name: 'isJquery',
      message: '项目是否需要JQuery?',
      type: 'confirm',
      default: true
    },
    {
      name: 'isBootstrap',
      message: '项目是否需要Bootstrap?',
      type: 'confirm',
      default: true
    },
    {
      name: 'isTemplate',
      message: '项目是否需要模板开发?',
      type: 'confirm',
      default: false
    }
  ]
}