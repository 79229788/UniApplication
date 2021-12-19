import Comber from '../cb';
import Model from '../modules/model';
import utils from '../utils/common';
import _extend from 'lodash/extend';
import _find from 'lodash/find';
import _findIndex from 'lodash/findIndex';
import _remove from 'lodash/remove';
import _isString from 'lodash/isString';
import _isObject from 'lodash/isObject';
import _isArray from 'lodash/isArray';
import _each from 'lodash/each';
import _filter from 'lodash/filter';
import _groupBy from 'lodash/groupBy';

//********************************定义集合类
//********************************
//********************************
const Collection = function(models, options) {
  options = options || {};
  if (options.model) this.setModel(options.model);
  this.clear();
  this.attributes = {};
  this.models = [];
  this.add(models);
  this.length = this.models.length;
  this.init();
};
_extend(Collection.prototype, {
  model: Model,
  storageName: '',
  /**
   * 初始化
   */
  init: function () {
    this._byId = {};
    this.validationGroups = [];
  },
  /**
   * 设置模型
   * @param model
   */
  setModel: function (model) {
    this.model = model;
  },
  /**
   * 设置属性
   * @param key     属性名
   * @param value   属性值
   * @return {Model}
   */
  setAttr: function (key, value) {
    if(!key) return this;
    if(_isObject(key)) {
      return _each(key, (value, key) => {
        this.setAttr(key, value);
      });
    }else {
      this.attributes[key] = value;
    }
    return this;
  },
  /**
   * 获取模型
   * @param obj  模型id/对象
   * @return {*}
   */
  get: function (obj) {
    if(!obj) return null;
    if(_isString(obj)) {
      return this._byId[obj];
    }
    if(_isObject(obj)) {
      return _find(this.models, obj);
    }
    return null;
  },
  /**
   * 获取模型索引位置
   * @param obj 模型/对象/模型的id
   */
  getIndex: function (obj) {
    if(this.models.length === 0) return -1;
    if(_isString(obj)) {
      return _findIndex(this.models, (model) => {
        return this._getModelId(model) === obj;
      });
    }else if(_isObject(obj)) {
      const idAttribute = this.models[0].idAttribute;
      if(obj[idAttribute]) {
        return _findIndex(this.toOrigin(), { [idAttribute]: obj[idAttribute] });
      }else {
        return _findIndex(this.toOrigin(), obj);
      }
    }
    return -1;
  },
  /**
   * 添加模型(存在则替换，不存在则新增)
   * @param obj  模型/集合/对象（单个/数组）
   * @param isReplace 存在时，是否替换
   * @param location 指定位置（不存在时才生效）
   */
  add: function (obj, isReplace = true, location) {
    if(!obj) return;
    const objs = _isArray(obj) ? obj : [obj];
    for(let index in objs) {
      const _obj = objs[index];
      if(!_obj) continue;
      if(_obj.constructor === this.model) {
        const id = this._getModelId(_obj);
        if(this._byId[id] && isReplace) {
          const replaceIndex = this.getIndex(_obj);
          this.models[replaceIndex] = _obj;
        }else {
          if(location) {
            this.models.splice(location, 0, _obj);
          }else {
            this.models.push(_obj);
          }
          this._byId[id] = _obj;
        }
      }else if(_obj.constructor === this.constructor) {
        this.add(_obj.models, isReplace, location);
      }else {
        this.add(new this.model(_obj), isReplace, location);
      }
    }
    this.length = this.models.length;
    return this;
  },
  /**
   * 添加模型(仅仅不存在则新增)
   * @param obj  模型/集合/对象（单个/数组）
   */
  weakAdd: function (obj) {
    this.add(obj, false);
  },
  /**
   * 添加模型到指定位置
   * @param obj 同add
   * @param index
   */
  insert: function (obj, index) {
    this.add(obj, false, index);
  },
  /**
   * 移除模型
   * @param obj 模型/集合/对象/模型的id（单个/数组）
   */
  remove: function (obj) {
    if(!obj) return;
    if(this.models.length === 0) return;
    const objs = _isArray(obj) ? obj : [obj];
    for(let index in objs) {
      const _obj = objs[index];
      if(!obj) continue;
      if(_obj.constructor === this.model || _isString(_obj)) {
        const id = _isString(_obj) ? _obj : this._getModelId(_obj);
        _remove(this.models, model => this._getModelId(model) === id);
        delete this._byId[id];
      }else if(_obj.constructor === this.constructor) {
        this.remove(_obj.models);
      }else {
        const idAttribute = this.models[0].idAttribute;
        this.remove(_obj[idAttribute]);
      }
    }
    this.length = this.models.length;
    return this;
  },
  /**
   * 清理所有模型
   */
  clear: function() {
    this.models = [];
    this.length = 0;
    this._byId = {};
  },
  /**
   * 克隆集合
   * @return {Model}
   */
  clone: function() {
    const objects = [];
    this.models.forEach(model => objects.push(model.toOrigin()));
    return new this.constructor(objects);
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
   * @return {Array}
   */
  toOrigin: function () {
    const objects = [];
    this.models.forEach(model => objects.push(model.toOrigin()));
    return objects;
  },
  /**
   * 获取模型id
   * @param models  指定模型数组（不指定则获取集合中全部模型）
   * @return {Array}
   */
  getIds: function (models) {
    const ids = [];
    (models || this.models).forEach(model => {
      ids.push(this._getModelId(model));
    });
    return ids;
  },
  /**
   * 是否改动过模型属性
   * @return {boolean}
   */
  isChanged: function () {
    let change = false;
    for(let key in this.models) {
      if(this.models[key].isChanged()) {
        change = true;
        break;
      }
    }
    return change;
  },
  /**
   * 验证是否有效
   * @return {boolean}
   */
  isValid: function (validateFirst = false) {
    const validationTasks = [];
    for(let key in this.models) {
      validationTasks.push(this.models[key].isValid(false));
    }
    return new Promise((ok, no) => {
      Promise.all(validationTasks).then(() => {
        ok();
      }).catch(({ uid, errors, fields }) => {
        if(validateFirst) {
          const error = new Error();
          error.code = errors[0].field;
          error.message = errors[0].message;
          Comber.getConfig().alert(error.message);
          return no(error);
        }
        no({ uid, fields });
      });
    });
  },
  /**
   * 设置验证群组
   * @param groupNames 组名
   */
  setValidationGroup: function (groupNames) {
    this.models.forEach(model => {
      model.setValidationGroup(groupNames);
    });
  },
  /**
   * 取出服务器数据
   */
  fetch: function (options) {
    const opts = _extend({
      url: null,
      searchData: null,
      pageNum: null,
      pageSize: null,
      isUpdate: true,
      originData: false,
      publicHeaders: true,
      customHeaders: null,
    }, options || {});
    if(!opts.url) throw new Error('fetch url is not allowed to be empty');
    Comber.getConfig().beforeGetHandler.call(this, opts, 'collection');
    const searchUrl = opts.searchData ? '/' + encodeURIComponent(JSON.stringify(opts.searchData)) : '';
    const pageParamUrl = (opts.pageNum || opts.pageNum === 0) && (opts.pageSize || opts.pageSize === 0) ? '/' + opts.pageNum + '/' + opts.pageSize : '';
    const domain = Comber.getConfig().apiUrl || '';
    opts.url += searchUrl + pageParamUrl;
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
    if(this.sessionToken) {
      if(!requestOption.headers) requestOption.headers = {};
      requestOption.headers.sess = this.sessionToken;
    }
    const headers = {};
    if(opts.publicHeaders) Comber.getConfig().headersHandler.call(this, headers);
    _extend(headers, opts.customHeaders);
    if(JSON.stringify(headers) !== '{}') requestOption.headers = headers;
    return new Promise((ok ,no) => {
      Comber.request(requestOption).then(res => {
        const data = Comber.getConfig()
          .dataHandler.call(this, res.data, 'collection') || res.data;
        if(opts.isUpdate) this.add(data);
        if(opts.originData) return ok(res.data);
        ok(data);
      }).catch(error => {
        error = utils.handleError(error);
        no(error);
        Comber.getConfig().onXHRError(error);
      });
    });
  },

  //**********lodash方法
  each: function (fn) {
    _each(this.models, fn);
  },
  filter: function (fn) {
    return _filter(this.models, fn);
  },
  find: function (fn) {
    return _find(this.models, fn);
  },
  map: function (fn) {
    const newModels = this.clone().models.map(fn);
    return new this.constructor(newModels);
  },
  groupBy: function (fn) {
    return _groupBy(this.models, fn);
  },

  //**********获取模型id
  _getModelId: function (model) {
    return model[model.idAttribute]
      ? model[model.idAttribute]
      : model[model.uidAttribute];
  },

});

//*************************************
//*************************************集合持久化
//*************************************
/**
 * 保存当前集合数据到本地
 * @param storageName
 */
Collection.prototype.saveCurrentInStorage = async function (storageName) {
  storageName = storageName || this.constructor.storageName;
  if(!storageName) throw new Error('Collection storageName is not allowed to be empty');
  const storage = new Comber.Storage();
  await storage.setStorage(storageName, this.toOrigin());
};
/**
 * 删除当前本地的集合数据
 * @param storageName
 */
Collection.deleteCurrentFromStorage = async function (storageName) {
  const storage = new Comber.Storage();
  await storage.deleteStorage(storageName || this.storageName);
};
/**
 * 获取当前本地的集合数据
 * @param storageName
 * @return {*|string}
 */
Collection.getCurrentFromStorage = async function (storageName) {
  const storage = new Comber.Storage();
  const json = await storage.getStorage(storageName || this.storageName);
  return new this.prototype.constructor(JSON.parse(json));
};

export default Collection;
