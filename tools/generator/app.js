const pathUtils = require('path');
const FileUtils = require('../utils/FileUtils');
const _ = require('lodash');
const args = process.argv.slice(2);

(async () => {
  const commandName = args[0];
  const generatorPath = pathUtils.join(__dirname, commandName, 'Generator.js');
  const templateDir = pathUtils.join(__dirname, commandName, 'templates');
  if(!await FileUtils.existFile(generatorPath)) {
    return console.error('[generator]: 命令不存在，请检查');
  }
  const generator = require(generatorPath);
  const scope = { rootPath: pathUtils.join(__dirname, '../../') };
  scope.args = args.slice(1);
  generator.before(scope, (error) => {
    (async () => {
      if(error) throw error;
      //***处理模板文件
      let isBreak = false;
      const targets = generator.targets;
      for(let target in targets) {
        let templateName = targets[target].template;
        if(commandName === 'page') {
          if(scope.moduleName === 'list') templateName = templateName.replace('module', 'list');
        }
        const templateData = await FileUtils.readFile(pathUtils.join(templateDir, templateName));
        const templateCode = _.template(templateData)(scope);
        let targetPath = pathUtils.join(scope.rootPath, target);
        (targetPath.match(/:[^\/.]*/g) || []).forEach(variable => {
          targetPath = targetPath.replace(variable, scope[variable.slice(1)]);
        });
        if(await FileUtils.existFile(targetPath)) {
          console.error('[generator]: 目标已存在，无法重复创建');
          isBreak = true;
          break;
        }
        await FileUtils.writeFile(targetPath, null, templateCode, false);
      }
      if(commandName === 'page') {
        //***处理配置文件
        const pageTitle = args[4] || '页面标题';
        const pageConfigPath = pathUtils.join(scope.rootPath, 'pages.json');
        const pageMapPath = pathUtils.join(scope.rootPath, 'pages.map.js');
        const pageConfigs = JSON.parse(await FileUtils.readFile(pageConfigPath));
        const pagePath = scope.groupName === 'group-main'
          ? `pages/group-main/pages/${scope.pageKebabName}/index`
          : `${scope.pageKebabName}/index`;
        const pageData = {
          path: pagePath,
          style: {}
        };
        if(scope.groupName === 'group-main') {
          const existPageData = _.find(pageConfigs.pages,
              item => item.path === pagePath);
          if(existPageData) {
            Object.assign(existPageData.style, pageData.style);
          }else {
            pageConfigs.pages.push(pageData);
          }
        }else {
          if(!pageConfigs.subPackages) pageConfigs.subPackages = [];
          const rootPath = `pages/${scope.groupKebabName}/pages`;
          const existPageGroup = _.find(pageConfigs.subPackages,
              item => item.root === rootPath);
          if(existPageGroup) {
            const existPageData = _.find(existPageGroup.pages,
                item => item.path === pagePath);
            if(existPageData) {
              Object.assign(existPageData.style, pageData.style);
            }else {
              existPageGroup.pages.push(pageData);
            }
          }else {
            pageConfigs.subPackages.push({
              root: rootPath,
              pages: [pageData]
            });
          }
        }
        const configCode = JSON.stringify(pageConfigs, null, 2);
        await FileUtils.writeFile(pageConfigPath, null, configCode);
        //***处理页面名映射文件
        const pageNameMap = {};
        pageConfigs.pages.forEach(page => {
          const nameEls = page.path.split('/');
          const name = _.camelCase(`${nameEls[1]}-${nameEls[3]}`);
          pageNameMap[name] = '/' + page.path;
        });
        pageConfigs.subPackages.forEach(item => {
          const rootEls = item.root.split('/');
          item.pages.forEach(page => {
            const nameEls = page.path.split('/');
            const name = _.camelCase(`${rootEls[1]}-${nameEls[0]}`);
            pageNameMap[name] = '/' + item.root + '/' + page.path;
          });
        });
        const pageNameMapCode = `export default ${JSON.stringify(pageNameMap, null, 2)}`;
        await FileUtils.writeFile(pageMapPath, null, pageNameMapCode);
      }
      if(!isBreak) console.log('[generator]: 目标已成功生成');
    })().catch(error => {
      console.error(error);
    });
  });
})().catch(error => {
  console.error(error);
});