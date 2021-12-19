const _ = require('lodash');
/**
 * sails-generate-page-module
 *
 * Usage:
 * `sails generate page module`
 *
 * @description Generates a page module
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
    if (!scope.args[0]) return cb( new Error('Please provide a name for this page module.') );
    if (!scope.rootPath) return cb( INVALID_SCOPE_VARIABLE('rootPath') );
    //设置模板变量
    scope.groupName = scope.args[0];
    scope.pageName = scope.args[1] || 'pageName';
    scope.moduleName = (scope.args[2] || 'moduleName');
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



/**
 * INVALID_SCOPE_VARIABLE()
 *
 * Helper method to put together a nice error about a missing or invalid
 * scope variable. We should always validate any required scope variables
 * to avoid inadvertently smashing someone's filesystem.
 *
 * @param {String} varname [the name of the missing/invalid scope variable]
 * @param {String} details [optional - additional details to display on the console]
 * @param {String} message [optional - override for the default message]
 * @return {Error}
 * @api private
 */

function INVALID_SCOPE_VARIABLE (varname, details, message) {
  const DEFAULT_MESSAGE =
  'Issue encountered in generator "page":\n'+
  'Missing required scope variable: `%s`"\n' +
  'If you are the author of `sails-generate-page`, please resolve this '+
  'issue and publish a new patch release.';

  message = (message || DEFAULT_MESSAGE) + (details ? '\n'+details : '');
  message = util.inspect(message, varname);

  return new Error(message);
}



