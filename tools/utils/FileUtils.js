const fs = require('fs');
const pathUtils = require('path');
const _ = require('lodash');

module.exports = {
  /**
   * 判断文件/目录是否存在
   * @param path
   */
  existFile: async function (path) {
    try {
      return fs.existsSync(path);
    }catch (error) {
      throw error;
    }
  },
  /**
   * 创建目录
   * @param dirPath
   * @param mode
   * @return {Promise.<void>}
   */
  createDir: async function (dirPath, mode) {
    try {
      mode = mode || 0o777;
      if(!fs.existsSync(dirPath)) {
        const dirNames = dirPath.split('/');
        for (let i = 2; i <= dirNames.length; i ++) {
          const path = dirPath.split('/').slice(0, i).join('/');
          if(!fs.existsSync(path)) {
            fs.mkdirSync(path, mode);
          }
        }
      }
    }catch (error) {
      throw error;
    }
  },
  /**
   * 读取文件内容
   * @param dirPath   目录路径
   * @param filename  文件名
   * @return {Promise.<string>}
   */
  readFile: async function (dirPath, filename = '') {
    try {
      if(!filename) {
        filename = _.last(dirPath.split('/'));
        dirPath = dirPath.replace(`/${filename}`, '');
      }
      const filePath = pathUtils.join(dirPath, filename);
      if(!fs.existsSync(dirPath)) return '';
      return fs.readFileSync(filePath, 'utf-8');
    }catch (error) {
      throw error;
    }
  },
  /**
   * 写入文件
   * @param dirPath     目录路径
   * @param filename    文件名
   * @param text        写入文本
   * @param isOverride  是否覆盖重写
   * @return {Promise.<void>}
   */
  writeFile: async function (dirPath, filename, text, isOverride = true) {
    try {
      if(!filename) {
        filename = _.last(dirPath.split('/'));
        dirPath = dirPath.replace(`/${filename}`, '');
      }
      const filePath = pathUtils.join(dirPath, filename);
      if(!fs.existsSync(filePath)) {
        await this.createDir(dirPath);
        return fs.writeFileSync(filePath, text);
      }
      if(isOverride) fs.writeFileSync(filePath, text);
    }catch (error) {
      throw error;
    }
  },
  /**
   * 追加内容到文件
   *
   * @param dirPath     目录路径
   * @param filename    文件名
   * @param text        写入文本
   * @return {Promise.<*>}
   */
  appendFile: async function (dirPath, filename, text) {
    try {
      if(!filename) {
        filename = _.last(dirPath.split('/'));
        dirPath = dirPath.replace(`/${filename}`, '');
      }
      const filePath = pathUtils.join(dirPath, filename);
      if(!fs.existsSync(dirPath)) {
        await this.createDir(dirPath);
        return fs.writeFileSync(filePath, text);
      }
      fs.appendFileSync(filePath, text);
    }catch (error) {
      throw error;
    }
  },
  /**
   * 获取文件列表
   * @param dirPath
   * @return {Promise.<Array>}
   */
  getFileList: async function (dirPath) {
    if(!(await this.existFile(dirPath))) return [];
    const files = [];
    const filePaths = await this.getFilePathList(dirPath);
    for(let path of filePaths) {
      files.push({
        path: path,
        file: fs.readFileSync(path)
      });
    }
    return files;
  },
  /**
   * 获取文件本地路径列表
   * @param dirPath 目录路径
   */
  getFilePathList: async function (dirPath) {
    if(!(await this.existFile(dirPath))) return [];
    const paths = [];
    (function getList(dirPath) {
      const files = fs.readdirSync(dirPath);
      for(let file of files) {
        if(typeof file === 'string' && file.indexOf('.') === 0 || typeof file === 'function') continue;
        const filePath = pathUtils.join(dirPath, file);
        if(fs.lstatSync(filePath).isDirectory()) {
          getList(filePath);
        }else {
          paths.push(filePath);
        }
      }
    })(dirPath);
    return paths;
  },

};

