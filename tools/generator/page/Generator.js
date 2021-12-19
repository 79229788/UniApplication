const _ = require('lodash');

/**
 * sails-generate-page
 *
 * Usage:
 * `sails generate page`
 *
 * @description Generates a page
 * @help See http://links.sailsjs.org/docs/generators
 */

module.exports = {

  /**
   * `before()` is run before executing any of the `targets`
   * defined below.
   *
   * This is where we can validate user input, configure default
   * scope variables, get extra dependencies, and so on.
   *
   * @param  {Object} scope
   * @param  {Function} cb    [callback]
   */
  before: function (scope, cb) {
    if (!scope.args[0]) return cb( new Error('Please provide a name for this page.') );
    if (!scope.rootPath) return cb( INVALID_SCOPE_VARIABLE('rootPath') );
    //设置模板变量
    scope.groupName = scope.args[0];
    scope.pageName = scope.args[1] || 'pageName';
    scope.moduleName = (scope.args[2] || 'moduleName');
    scope.titleName = (scope.args[3] || '页面标题');
    //[单元]短横线命名
    scope.groupKebabName = _.kebabCase(scope.groupName);
    scope.pageKebabName = _.kebabCase(scope.pageName);
    scope.moduleKebabName = _.kebabCase(scope.moduleName);
    //[单元]驼峰命名
    scope.groupCamelName = _.camelCase(scope.groupName);
    scope.pageCamelName = _.camelCase(scope.pageName);
    scope.moduleCamelName = _.camelCase(scope.moduleName);
    //[单元]首字母大写命名
    scope.groupCamelNameFirstUpper = _.upperFirst(scope.groupCamelName);
    scope.pageCamelNameFirstUpper = _.upperFirst(scope.pageCamelName);
    scope.moduleCamelNameFirstUpper = _.upperFirst(scope.moduleCamelName);
    //[完整]短横线命名
    scope.pageFullKebabName = _.kebabCase(scope.groupCamelNameFirstUpper + scope.pageCamelNameFirstUpper);
    scope.moduleFullKebabName = _.kebabCase(scope.groupCamelNameFirstUpper + scope.pageCamelNameFirstUpper + scope.moduleCamelNameFirstUpper);
    //[完整]驼峰命名
    scope.pageFullCamelName = _.camelCase(scope.pageFullKebabName);
    scope.moduleFullCamelName = _.camelCase(scope.moduleFullKebabName);
    //[完整]首字母收驼峰命名
    scope.pageFullCamelNameFirstUpper = _.upperFirst(scope.pageFullCamelName);
    scope.moduleFullCamelNameFirstUpper = _.upperFirst(scope.moduleFullCamelName);

    cb();
  },


  /**
   * The files/folders to generate.
   * @type {Object}
   */
  targets: {
    './pages/:groupKebabName/pages/:pageKebabName/index.vue': { template: 'index.template.js' },
    './pages/:groupKebabName/pages/:pageKebabName/modules/:moduleKebabName.vue': { template: 'module.template.js' },
  },


  /**
   * The absolute path to the `templates` for this generator
   * (for use with the `template` helper)
   *
   * @type {String}
   */
  templatesDirectory: require('path').resolve(__dirname, './templates')
};






