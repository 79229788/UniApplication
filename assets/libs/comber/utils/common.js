import Comber from '../cb';
import _isObject from 'lodash/isObject';
import _isArray from 'lodash/isArray';
import _isNumber from 'lodash/isNumber';
import _isString from 'lodash/isString';
import _isBoolean from 'lodash/isBoolean';
import _isUndefined from 'lodash/isUndefined';
import _isNaN from 'lodash/isNaN';
import _isEmpty from 'lodash/isEmpty';
import _isDate from 'lodash/isDate';

export default {
  /**
   * 处理错误
   * @param res
   */
  handleError: function (res) {
    const errorInfo = {};
    if(res instanceof Error) {
      errorInfo.code = res.code;
      errorInfo.message = res.toString();
    }else if(_isObject(res)) {
      errorInfo.code = res.code || res.status || res.statusCode;
      errorInfo.message = res.message || res.errMsg || res.statusText;
      if(res.data) {
        if(res.data.code) errorInfo.code = res.data.code;
        if(res.data.message) errorInfo.message = res.data.message;
        if(res.data.stack) errorInfo.stack = res.data.stack;
      }
    }else {
      errorInfo.message = res;
    }
    const error = new Error();
    error.code = [null, undefined, ''].indexOf(errorInfo.code) < 0
      ? errorInfo.code : -1;
    error.message = errorInfo.message || '未知错误';
    if(errorInfo.stack) error.stack = errorInfo.stack;
    Comber.getConfig().onXHRError(error);
    return error;
  },
  /**
   * 获取字符串字节数
   * @param str
   * @returns {number}
   */
  getCharLength: function(str) {
    let iLength = 0;
    for(let i = 0; i< str.length; i++) {
      if(str.charCodeAt(i) > 255){
        iLength += 2;
      }else {
        iLength += 1;
      }
    }
    return iLength;
  },
  /**
   * 扁平化对象
   * @param obj
   * @return {{}}
   */
  flattenObject: function flatten( obj ) {
    const output = {};
    for(let i in obj) {
      if(!obj.hasOwnProperty(i)) continue;
      //文件类型不做处理
      if(utils.isFileType(obj[i])) {
        output[i] = obj[i];
      }else if(typeof obj[i] === 'object') {
        const flatObject = flatten(obj[i]);
        for(let x in flatObject) {
          if (!flatObject.hasOwnProperty(x)) continue;
          output[i + '[' + x + ']'] = flatObject[x];
        }
      }else {
        output[i] = obj[i];
      }
    }
    return output;
  },
  /**
   * 判断基本类型
   * @param value
   * @param fnType String、Boolean等等(可为数组)
   * @return {boolean}
   */
  isType: function(value, fnType) {
    const fnTypes = _isArray(fnType) ? fnType : [fnType];
    let isType = true;
    for(let i = 0; i < fnTypes.length; i ++) {
      const typeName = fnTypes[i].prototype.constructor.name;
      if(typeName === 'Number' && !_isNumber(value)) { isType = false;break; }
      if(typeName === 'String' && !_isString(value)) { isType = false;break; }
      if(typeName === 'Boolean' && !_isBoolean(value)) { isType = false;break; }
      if(typeName === 'Date' && !_isDate(value)) { isType = false;break; }
      if(typeName === 'Array' && !_isArray(value)) { isType = false;break; }
    }
    return isType;
  },
  /**
   * 是否是文件类型
   * @param attr
   * @return {boolean}
   */
  isFileType: function(attr) {
    return attr instanceof File
      || attr instanceof FileList
      || (attr instanceof Array
        && (attr[0] instanceof File || attr[0] instanceof Blob))
      || attr instanceof Blob;
  },
  /**
   * 判断是否为无效值[ '', null, undefined, NaN, [], {} ]
   * @param value
   * @return {boolean|*}
   */
  isInvalid: function(value) {
    return value === ''
      || value === null
      || _isUndefined(value)
      || _isNaN(value)
      || (!_isDate(value) && (_isArray(value) || _isObject(value)) && _isEmpty(value));
  },
}
