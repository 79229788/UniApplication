import Comber from '../cb';
import Schema from 'async-validator';
import utils from '../utils/common';
import _extend from 'lodash/extend';
import _uniqueId from 'lodash/uniqueId';
import _cloneDeep from 'lodash/cloneDeep';
import _isObject from 'lodash/isObject';
import _isString from 'lodash/isString';
import _isArray from 'lodash/isArray';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _compact from 'lodash/compact';
import _each from 'lodash/each';
import _get from 'lodash/get';
import _has from 'lodash/has';
//********************************定义模型类
//********************************
//********************************
const Model = function(data, options) {
  options = options || {};
  data = data || {};
  if(data instanceof Model) data = data.toOrigin();
  if(options.merge) data = _extend({}, this.defaults, data);
  this[this.uidAttribute] = _uniqueId(this.uidPrefix);
  this.attributes = {};
  this.set(data);
  this._previousAttributes = _cloneDeep(this.attributes);
  this.init();
};
_extend(Model.prototype, {
  uidPrefix: 'u',
  uidAttribute: '_uid',
  idAttribute: 'id',
  fileAttribute: 'file',
  storageName: '',
  defaults: {},
  validators: {},
  /**
   * 初始化
   */
  init: function () {
    this.validationGroups = [];
  },
  /**
   * 获取属性
   * @param attr  属性名
   * @return {*}
   */
  get: function (attr) {
    switch (attr) {
      case this.idAttribute:
        return this.id;
      default:
        return _get(this.attributes, attr) ;
    }
  },
  /**
   * 获取关联的模型数据
   * @param attr  属性名
   * @param Model 对应模型
   * @return {*}
   */
  getPointerModel: function (attr, Model) {
    const pointerData = this.get(attr);
    if(pointerData) {
      if(_isObject(pointerData) && !_isEmpty(pointerData)) {
        if(pointerData.constructor === Model) return pointerData;
        return new Model(pointerData, { merge: false });
      }else if(_isString(pointerData)) {
        try {
          const obj = JSON.parse(pointerData);
          if(!_isEmpty(obj)) return new Model(obj, { merge: false });
        }catch(error) {}
      }
    }
    return null;
  },
  /**
   * 获取关联的模型数组
   * @param attr 属性名
   * @param Model 对应模型
   * @returns {null}
   */
  getPointerModelArray: function (attr, Model) {
    const pointersData = this.get(attr);
    if(pointersData) {
      if(_isArray(pointersData) && pointersData.length > 0) {
        return _compact(pointersData.map(function (pointerData) {
          if(_isObject(pointerData) && !_isEmpty(pointerData)) {
            if(pointerData.constructor === Model) return pointerData;
            return new Model(pointerData, {merge: false});
          }else if(_isString(pointerData)) {
            try {
              const obj = JSON.parse(pointerData);
              if(!_isEmpty(obj)) return new Model(obj, {merge: false});
            }catch(error) {}
          }
          return null;
        }));
      }else if(_isString(pointersData)) {
        try {
          return _compact(JSON.parse(pointersData).map(function (obj) {
            if(!_isEmpty(obj)) return new Model(obj, {merge: false});
            return null;
          }));
        }catch(error) {}
      }
    }
    return [];
  },
  /**
   * 设置属性
   * @param key     属性名
   * @param value   属性值
   * @return {Model}
   */
  set: function (key, value) {
    if(!key) return this;
    if(_isObject(key)) {
      _each(key, (value, key) => {
        this.set(key, value);
      });
      return this;
    }else {
      this.attributes[key] = value;
    }
    if(_has(this.attributes, this.idAttribute)) this.id = this.attributes[this.idAttribute];
    delete this.attributes[this.idAttribute];
    return this;
  },
  /**
   * 弱设置（仅当属性的值为无效值时[ '', null, undefined, NaN, [], {} ]，则设置属性）
   * @param key
   * @param value
   */
  weakSet: function (key, value) {
    if(utils.isInvalid(this.get(key))) this.set(key, value);
  },
  /**
   * 弱添加属性（仅当属性不存在时，则设置属性）
   * @param key
   * @param value
   */
  weakAdd: function (key, value) {
    if(!this.has(key)) this.set(key, value);
  },
  /**
   * 取消设置key
   * @param keys
   */
  unset: function (keys) {
    keys = _isArray(keys) ? keys : [keys];
    keys.forEach(key => {
      delete this.attributes[key];
    });
  },
  /**
   * 计数操作
   * @param key
   * @param value
   */
  increment: function (key, value) {
    this.set(key, (this.get(key) || 0) + Number(value));
  },
  /**
   * 判断属性是否存在
   * @param attr  属性名
   * @return {boolean}
   */
  has: function (attr) {
    return _has(this.attributes, attr);
  },
  /**
   * 设置本地存储key名
   * @param value
   */
  setStorageName: function (value) {
    this.storageName = value;
  },
  /**
   * 转化为json
   * @return {string}
   */
  toJSON: function () {
    return JSON.stringify(this.toOrigin());
  },
  /**
   * 转化为原始数据
   * @return {object}
   */
  toOrigin: function () {
    const data = _cloneDeep(this.attributes);
    data[this.idAttribute] = this.id;
    return data;
  },
  /**
   * 克隆模型
   * @return {Model}
   */
  clone: function() {
    return new this.constructor(this.toOrigin());
  },
  /**
   * 是否改动过属性
   * @return {boolean}
   */
  isChanged: function () {
    return !_isEqual(this.attributes, this._previousAttributes);
  },
  /**
   * 验证是否有效
   * @return {Promise<*>}
   */
  isValid: function (validateFirst = false) {
    return new Promise((ok, no) => {
      let _validators = this.validators;
      if(this.validationGroups === '*') {
        const allGroups = [{}];
        for(let allKey in this.validators) {
          allGroups.push(this.validators[allKey]);
        }
        _validators = _extend.apply(this, allGroups);
      }else {
        const customGroups = [{}];
        const validationGroups = this.validationGroups;
        if(validationGroups.length === 0) {
          return ok();
        }
        validationGroups.forEach(customKey => {
          const customGroup = this.validators[customKey];
          customGroups.push(customGroup);
        });
        _validators = _extend.apply(this, customGroups);
      }
      const validator = new Schema(_validators);
      validator.validate(
        this.attributes,
        {
          suppressWarning: !Comber.getConfig().debug,
          first: validateFirst
        }
      ).then(() => {
        ok();
      }).catch(({ errors, fields }) => {
        if(validateFirst) {
          const error = new Error();
          error.code = errors[0].field;
          error.message = errors[0].message;
          Comber.getConfig().alert(error.message);
          return no(error);
        }
        no({
          uid: this[this.uidAttribute],
          errors, fields
        });
      });
    });
  },
  /**
   * 设置验证群组
   * @param groupNames 组名
   */
  setValidationGroup: function (groupNames) {
    if(groupNames !== 'all') {
      groupNames = _isArray(groupNames)
        ? groupNames : [groupNames];
    }
    this.validationGroups = groupNames;
  },
  /**
   * 取出数据从服务器
   * @param options
   * @return {Promise<*>}
   */
  fetch: function (options) {
    const opts = _extend({
      url: null,
      originData: false,
    }, options || {});
    if(!opts.url) throw new Error('fetch url is not allowed to be empty');
    Comber.getConfig().beforeGetHandler.call(this, opts, 'model');
    const domain = Comber.getConfig().apiUrl || '';
    if(Comber.getConfig().requestVersion) {
      if(opts.url.indexOf('?') < 0) {
        opts.url += `?v=${Math.floor(new Date().getTime() / 1000)}`;
      }else {
        opts.url += `&v=${Math.floor(new Date().getTime() / 1000)}`;
      }
    }
    const requestOption = {
      url: opts.url.indexOf('http') === 0 ? opts.url : (domain + opts.url),
      method: 'get',
      timeout: 1000 * Comber.getConfig().getTimeout,
    };
    const headers = {};
    Comber.getConfig().headersHandler.call(this, headers);
    if(JSON.stringify(headers) !== '{}') requestOption.headers = headers;
    return new Promise((ok, no) => {
      Comber.request(requestOption).then(res => {
        if(opts.originData) return ok(res.data);
        const data = Comber.getConfig()
          .dataHandler.call(this, res.data, 'model') || res.data;
        if(_isObject(data)) {
          const model = new this.constructor(data, { merge: false });
          model._data = res.data;
          return ok(model);
        }
        ok(data);
      }).catch(error => {
        no(utils.handleError(error));
      });
    });
  },
  /**
   * 保存数据到服务器
   * @param options
   * @return {Promise<*>}
   */
  save: function (options) {
    const opts = _extend({
      url: null,
      useFormData: false,
      formFlatten: false,
      originData: false,
    }, options || {});
    return new Promise((ok, no) => {
      if(!opts.url) return no(new Error('save url is not allowed to be empty'));
      this.isValid(true).then(() => {
        Comber.getConfig().beforePostHandler.call(this, opts, 'model');
        const attrs = this._handleSavedObject(opts);
        const isFormData = attrs._hasFile || opts.useFormData;
        const formData = new FormData();
        if(isFormData) _each(attrs, (attr, key) => formData.append(key, attr));
        const domain = Comber.getConfig().apiUrl || '';
        const requestOption = {
          url: opts.url.indexOf('http') === 0 ? opts.url : (domain + opts.url),
          method: 'post',
          data: (isFormData ? formData : attrs),
          timeout: 1000 * Comber.getConfig().postTimeout,
        };
        const headers = {
          'content-type': isFormData
            ? 'application/x-www-form-urlencoded'
            : 'application/json;charset=utf-8'
        };
        Comber.getConfig().headersHandler.call(this, headers);
        if(JSON.stringify(headers) !== '{}') requestOption.headers = headers;
        Comber.request(requestOption).then(res => {
          if(opts.originData) return ok(res.data);
          const data = Comber.getConfig()
            .dataHandler.call(this, res.data, 'model') || res.data;
          if(_isObject(data)) {
            this.set(data);
            return ok(this, res.data);
          }
          return ok(data, res.data);
        }).catch(error => {
          no(utils.handleError(error.response || error));
        });
      }).catch(error => {
        no(utils.handleError(error));
      });
    });
  },
  /**
   * 删除数据从服务器
   * @param options
   * @return {Promise<*>}
   */
  delete: function (options) {
    const opts = _extend({
      url: null,
      originData: false,
    }, options || {});
    if(!opts.url) throw new Error('delete url is not allowed to be empty');
    Comber.getConfig().beforePostHandler.call(this, opts, 'model');
    const domain = Comber.getConfig().apiUrl || '';
    const requestOption = {
      url: opts.url.indexOf('http') === 0 ? opts.url : (domain + opts.url),
      method: 'delete',
      data: this.toOrigin(),
      timeout: 1000 * Comber.getConfig().postTimeout,
    };
    const headers = {
      'content-type': 'application/json;charset=utf-8'
    };
    Comber.getConfig().headersHandler.call(this, headers);
    if(JSON.stringify(headers) !== '{}') requestOption.headers = headers;
    return new Promise((ok, no) => {
      Comber.request(requestOption).then(res => {
        if(opts.originData) return ok(res.data);
        const data = Comber.getConfig()
          .dataHandler.call(this, res.data, 'model') || res.data;
        return ok(this, data);
      }).catch(error => {
        no(utils.handleError(error.response || error));
      });
    });
  },
  /**
   * 处理待保存的数据
   * @param options
   * @return {*|Object}
   * @private
   */
  _handleSavedObject: function (options) {
    // 检查formData属性是否设置，并且检查是否存在file属性
    let attrs = _extend(this.toOrigin(), { _hasFile: false, _fileCount: 0 });
    const existFile = utils.isFileType(this.attributes[this.fileAttribute]);
    if(options.useFormData === true || existFile) {
      if(existFile) {
        attrs._hasFile = true;
        attrs._fileCount = 1;
      }
      const fileAttr = attrs[this.fileAttribute];
      delete attrs[this.fileAttribute];
      if(options.formFlatten === true) attrs = utils.flattenObject(attrs);
      attrs[this.fileAttribute] = fileAttr;
      _each(attrs, (attr, key) => {
        if (key === this.fileAttribute
          && (attr instanceof FileList || attr instanceof Array && attr.length > 0)
          && (attr[0] instanceof File || attr[0] instanceof Blob)) {
          attrs['_fileCount'] = attr.length;
          _each(attr, (file, index) => {
            attrs[key + index] = file;
          });
        }else {
          attrs[key] = attr;
        }
      });
    }else {
      _extend(attrs, this.toOrigin());
    }
    return attrs;
  },

});
//*************************************
//*************************************模型持久化
//*************************************
/**
 * 保存当前模型数据到本地
 * @param storageName
 * @return {Promise<*>}
 */
Model.prototype.saveCurrentInStorage = async function (storageName) {
  storageName = storageName || this.constructor.storageName;
  if(!storageName) throw new Error('model storageName is not allowed to be empty');
  const storage = new Comber.Storage();
  const content = this.toOrigin();
  _each(this.constructor.prototype.sensitives, (item) => {
    delete content[item];
  });
  await storage.setStorage(storageName, content);
};
/**
 * 删除当前本地的模型数据
 * @param storageName
 * @return {Promise<*>}
 */
Model.deleteCurrentFromStorage = async function (storageName) {
  const storage = new Comber.Storage();
  await storage.deleteStorage(storageName || this.storageName);
};
/**
 * 获取当前本地的模型数据
 * @param storageName
 * @return {*|string}
 */
Model.getCurrentFromStorage = async function (storageName) {
  const storage = new Comber.Storage();
  const json = await storage.getStorage(storageName || this.storageName);
  if(json) {
    return new this.prototype.constructor(JSON.parse(json));
  }
  return null;
};

export default Model;
