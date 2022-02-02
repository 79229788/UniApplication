import Vue from 'vue';
import _each from 'lodash/each';
import _isObject from 'lodash/isObject';
import _isString from 'lodash/isString';
import _isArray from 'lodash/isArray';
import _cloneDeep from 'lodash/cloneDeep';
import _extend from 'lodash/extend';
import _throttle from 'lodash/throttle';
import baseUtils from '@/assets/utils/base';
import macros from '@/configs/macros';
import extData from '@/cext.json';
import { MDObject } from '@/assets/data/models/MDObject';
import { MDUser } from '@/assets/data/models/MDUser';

const methods = {
  /**
   * 检查动作口令是否有效
   * @param token
   * @return {*}
   */
  checkActionToken: function (token) {
    return new Promise((ok) => {
      if(!token) return ok(false);
      this.$loading();
      (new MDObject()).fetch({
        url: '/auth/checkActionToken/' + token,
        originData: true,
      }).then(data => {
        this.$hideLoading();
        ok(data === 'ok');
      }).catch(error => {
        this.$hideLoading();
        this.$logError('checkActionToken', error);
        this.$alertLoadError(error);
      });
    });
  },
  /**
   * 检查本地是否登录
   */
  checkLocalLogin: function () {
    const currentUser = this.$getCurrentUser();
    const session = uni.getStorageSync('session');
    if(!session) return false;
    const expiredAt = uni.getStorageSync('sessionExpiredAt');
    if(!expiredAt || !currentUser
      || expiredAt < uni.app.moment().format('YYYY-MM-DD HH:mm:ss')) {
      return false;
    }
    return !!(currentUser
      && currentUser.get('nickname')
      && currentUser.get('nickname') !== '#匿名用户#');
  },
  /**
   * 检查云端是否登录
   * @return Promise<*>
   */
  checkCloudLogin: function () {
    return MDUser.isAuthed();
  },
  /**
   * 检查是否授权
   * @return Promise<*>
   */
  checkAuth: function () {
    if(!this.$checkLocalLogin()) {
      return Promise.resolve(false);
    }
    return MDUser.isAuthed();
  },
  /**
   * 跳转登录页面
   * @param token
   * @return {*}
   */
  redirectToLogin: _throttle(function () {
    const currentPath = this.$getCurrentPageFullPath();
    this.$log('准备重新跳转登录', currentPath);
    uni.redirectTo({
      url: '/pages/group-auth/pages/login/index' +
        '?point=' + encodeURIComponent(currentPath)
    });
  }, 1000, { trailing: false }),
  /**
   * 获取当前登录的用户
   * @param user
   * @param option
   */
  setCurrentUser: function (user, option) {
    if(!user) return;
    const opts = _extend({
      session: null,
      sessionTTL: null,
      replaceAll: true,
    }, option);
    try {
      const session = opts.session || user.get('_session');
      const sessionTTL = opts.sessionTTL || user.get('_sessionTTL');
      if(session) uni.setStorageSync('session', session);
      if(sessionTTL) {
        const expiredAt = uni.app.moment().add(sessionTTL, 'seconds')
          .format('YYYY-MM-DD HH:mm:ss');
        uni.setStorageSync('sessionExpiredAt', expiredAt);
      }
      user.unset(['_session', '_sessionTTL']);
      if(opts.replaceAll) {
        uni.setStorageSync('currentUser', user.toOrigin());
        uni.app.currentUser = user;
      }else {
        const currentUser = new MDUser(uni.getStorageSync('currentUser'));
        currentUser.set(user.toOrigin());
        uni.setStorageSync('currentUser', currentUser.toOrigin());
        uni.app.currentUser = currentUser;
      }
    }catch(error) {
      throw error;
    }
  },
  /**
   * 获取当前登录的用户(不代表实时登录状态，仅仅获取一个历史缓存数据)
   */
  getCurrentUser: function () {
    try {
      if(!uni.app.currentUser) uni.app.currentUser = uni.getStorageSync('currentUser');
      if(!uni.app.currentUser) return null;
      return uni.app.currentUser = new MDUser(uni.app.currentUser);
    }catch(error) {
      throw error;
    }
  },
  /**
   * 清理当前用户数据
   */
  clearCurrentUser: function () {
    uni.app.currentUser = null;
    uni.removeStorageSync('currentUser');
  },
  /**
   * 创建临时参数
   * @param options
   */
  postTmpParams: _throttle(function (options) {
    const params = _extend({
      expiryDay: 1,
      data: null,
      success: () => {}
    }, options);
    const item = new MDObject();
    item.set('expiryDay', params.expiryDay);
    item.set('data', params.data);
    this.$loading('处理中');
    this.$getCurrentShop().then(shopData => {
      item.set('companyId', shopData.objectId);
      return item.save({
        url: '/open/post',
        apiService: 'global',
        apiMethod: 'createTmpParamsData',
        originData: true,
      });
    }).then(res => {
      this.$hideLoading();
      params.success(res.data);
    }).catch(error => {
      this.$hideLoading();
      this.$logError('createTmpParams', error);
      this.$alertLoadError(error,
        () => this.$postTmpParams(...arguments));
    });
  }, 500, { trailing: false }),
  /**
   * 取出临时参数
   * @param id
   * @param options
   * @return {*}
   */
  fetchTmpParams: function (id, options) {
    const params = _extend({
      expiryDay: 1,
    }, options);
    return new Promise((ok, no) => {
      MDObject.getOSSData(
        `/tmp${params.expiryDay}/params/${id}.json`,
        { latest: false }
      ).then(data => {
        ok(data);
      }).catch(error => {
        no(error);
      });
    });
  },
  /**
   * 获取启动参数
   * @param launchQuery
   * @return {Promise<*>}
   */
  fetchLaunchQueryData: function (launchQuery) {
    return new Promise((ok, no) => {
      const query = launchQuery || {};
      if(query.scene) {
        return MDObject.getSceneParams(
          query.scene
        ).then(data => {
          ok(data || {});
        }).catch(error => no(error));
      }
      return ok(query);
    });
  },
  /**
   * 制作页面分享链接
   * @param shortPath
   * @param params
   * @return {Promise<string>}
   */
  makePageSharePath: function (shortPath, params) {
    return new Promise((ok, no) => {
      this.$getCurrentShop().then(shopData => {
        const referrerCid = uni.app.referrerData.referrerCid || shopData.objectId;
        const referrerUid = uni.app.currentUser && uni.app.currentUser.id || uni.app.referrerData.referrerUid;
        const referrerEid = uni.app.referrerData.referrerEid;
        const referrerLayer = uni.app.referrerData.referrerLayer;
        let url = `/pages/group-${shortPath.split('@')[0]}/pages/${shortPath.split('@')[1]}/index?`;
        url += `rcid=${referrerCid}`;
        if(referrerUid) url += `&ruid=${referrerUid}`;
        if(referrerEid) url += `&reid=${referrerEid}`;
        if(referrerLayer) url += `&rler=${referrerLayer}`;
        const args = [];
        for(let key in params) {
          if(params[key] === undefined) continue;
          args.push(`${key}=${params[key]}`);
        }
        ok(url + '&' + args.join('&'));
      }).catch(error => {
        this.$toast('链接生成失败，请重试');
        no(error);
      });
    });
  },
  /**
   * 提示数据空
   * @param options
   */
  alertDataEmpty: function (options) {
    const params = Object.assign({
      title: '当前数据不存在',
      desc: '若有任何疑问，请及时联系我们',
      isBack: true,
    }, options);
    return this.$redirectTo({
      path: 'main@empty',
      query: {
        title: params.title,
        desc: params.desc,
        back: params.isBack ? 'yes' : undefined,
      }
    });
  },

  //  _______             __        __  __
  //  |       \           |  \      |  \|  \
  //  | $$$$$$$\ __    __ | $$____  | $$ \$$  _______
  //  | $$__/ $$|  \  |  \| $$    \ | $$|  \ /       \
  //  | $$    $$| $$  | $$| $$$$$$$\| $$| $$|  $$$$$$$
  //  | $$$$$$$ | $$  | $$| $$  | $$| $$| $$| $$
  //  | $$      | $$__/ $$| $$__/ $$| $$| $$| $$_____
  //  | $$       \$$    $$| $$    $$| $$| $$ \$$     \
  //   \$$        \$$$$$$  \$$$$$$$  \$$ \$$  \$$$$$$$
  /**
   * 检查小程序更新
   */
  checkAppletUpdate: function () {
    if(!uni.canIUse('getUpdateManager')) return;
    const updateManager = uni.getUpdateManager();
    updateManager.onCheckForUpdate(res => {
      if(res.hasUpdate) {
        uni.app.hasUpdate = true;
        this.$toast('发现当前程序有新的版本');
      }
    });
    updateManager.onUpdateReady(function () {
      uni.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否现在重启应用？',
        cancelText: '稍后再说',
        confirmText: '立即重启',
        confirmColor: uni.app.theme['primary-color'],
        success: (res) => {
          if(res.confirm) updateManager.applyUpdate();
        }
      });
    });
  },
  /**
   * 打印日志
   * @param data
   */
  log: function (...data) {
    this.$logHandler('info', data);
  },
  /**
   * 打印错误
   * @param name
   * @param error
   */
  logError: function (name, error) {
    const errorObject = baseUtils.handleRequestError(error);
    this.$logHandler('error', [name, `[${errorObject.code}]`, errorObject.message]);
  },
  /**
   * 日志打印处理
   * @param type
   * @param args
   */
  logHandler: function (type = 'info', args) {
    if(macros.DEBUG) {
      console.log(uni.app.moment().format('HH:mm:ss'), ...args);
    }else {
      // #ifdef MP-WEIXIN
      const log = wx.getRealtimeLogManager && wx.getRealtimeLogManager();
      if(log) {
        if(this.$getCurrentUser()) {
          args.unshift(this.$getCurrentUser().id);
        }
        args.unshift(macros.VERSION);
        args.unshift(uni.app.moment().format('YYYY-MM-DD HH:mm:ss'));
        log[type].apply(log, args.map(item => {
          if(_isArray(item)) return item.join(',');
          if(_isObject(item)) return JSON.stringify(item);
          return item;
        }));
        if(this.$getCurrentUser()) {
          log.setFilterMsg(this.$getCurrentUser().id);
        }
      }
      // #endif
    }
  },
  /**
   * 显示提示
   * @param {Object} text
   * @param {Object} icon
   * @param {Object} duration
   */
  toast: function (text, icon = 'none', duration) {
    text = text.slice(0, 100);
    setTimeout(() => {
      uni.showToast({
        title: text,
        icon: icon,
        duration: Math.min(duration || 200 * text.length, 10000),
      });
    }, 0);
  },
  /**
   * 提示错误
   * @param {Object} error
   */
  toastError: function (error) {
    const errorObject = baseUtils.handleRequestError(error);
    this.$toast(`[${errorObject.code}] ${errorObject.message}`)
  },
  /**
   * 隐藏提示
   */
  hideToast: function (delay) {
    if(delay) {
      return setTimeout(() => {
        uni.hideLoading();
        uni.hideToast();
      }, 0);
    }
    uni.hideLoading();
    uni.hideToast();
  },
  /**
   * 弹窗提示
   * @param {Object} text
   * @param {Object} cb
   */
  alert: function (text, cb) {
    uni.showModal({
      title: '温馨提示',
      content: text,
      showCancel: false,
      confirmColor: uni.app.theme['primary-color'],
      success: (res) => {
        if(res.confirm && cb) cb();
      }
    });
  },
  /**
   * 提示加载错误，等待用户重试
   * @param {Object} error
   * @param {Object} cb
   */
  alertLoadError: function (error, cb) {
    if(error && (error.code || error.message)) {
      //登录失效或无权限操作，不提示错误重试
      if(error.code === 403
        || error.code === 10001
        || error.code === 10002
        || error.code === 6001
      ) return;
      //用户若不存在，不提示错误重试
      if(error.message === 'currentUser not exist') return;
    }
    let retryCount = Number(uni.getStorageSync('AlertLoadErrorRetryCount') || 0);
    uni.showModal({
      title: '温馨提示',
      content: `[${error.code || -1}]网络出现异常，是否重试？`,
      showCancel: retryCount >= 3,
      cancelText: '返回上页',
      confirmText: '重试',
      confirmColor: uni.app.theme['primary-color'],
      success: (res) => {
        if(res.cancel) {
          retryCount = 0;
          if(getCurrentPages().length > 1) {
            return uni.navigateBack();
          }else {
            return uni.reLaunch({ url: 'pages/group-main/pages/home/index' });
          }
        }
        if(res.confirm) {
          retryCount ++;
          if(cb) return cb();
          this.$reloadCurrentPage();
        }
      },
      complete: () => {
        uni.setStorageSync('AlertLoadErrorRetryCount', retryCount);
      }
    });
  },
  /**
   * 显示加载中
   */
  loading: function (text = '加载中') {
    uni.showLoading({
      title: text,
      mask: true,
    });
  },
  /**
   * 隐藏加载中
   */
  hideLoading: function (delay) {
    if(delay) {
      return setTimeout(() => {
        uni.hideToast();
        uni.hideLoading();
      }, 0);
    }
    uni.hideToast();
    uni.hideLoading();
  },
  /**
   * 导航跳转
   * @param options
   */
  navigateTo: function (options) {
    options.action = 'navigateTo';
    this.$routerAction(options);
  },
  /**
   * 导航替换
   * @param options
   */
  redirectTo: function (options) {
    options.action = 'redirectTo';
    this.$routerAction(options);
  },
  /**
   * 导航重启
   * @param options
   */
  relaunchTo: function (options) {
    options.action = 'reLaunch';
    this.$routerAction(options);
  },
  /**
   * 路由动作
   * @param options
   */
  routerAction: function (options) {
    const opts = _extend({
      action: null,
      path: null,
      query: null,
    }, options);
    let url = opts.path;
    if(opts.path.indexOf('@') >= 0) {
      const names = opts.path.split('@');
      url = `/pages/group-${names[0]}/pages/${names[1]}/index`;
    }
    if(opts.query) {
      const params = [];
      _each(opts.query, (value, key) => {
        if(value !== undefined) params.push(`${key}=${value}`);
      });
      if(params.length > 0) url += `?${params.join('&')}`;
    }
    uni[opts.action](_extend({ url }, opts));
  },
  /**
   * 重置页面（激活vue实例中的reset方法，需自行实现重置数据的逻辑）
   * @param paths
   * @param scene
   * @param data
   */
  resetPages: function (paths, scene, data) {
    paths = _isArray(paths) ? paths : [paths];
    paths = paths.map(path => {
      if(path.indexOf('@') >= 0) {
        const names = path.split('@');
        return `/pages/group-${names[0]}/pages/${names[1]}/index`;
      }
      return path;
    });
    if(!uni._resetPages) uni._resetPages = {};
    paths.forEach(path => {
      if(!path) return;
      if(!uni._resetPages[path]) uni._resetPages[path] = [];
      uni._resetPages[path].push({
        reset: true,
        scene: scene,
        data: data,
      });
    });
  },
  /**
   * 网络请求
   * @param option
   */
  request: function (option) {
    return new Promise((ok, no) => {
      uni.request(Object.assign(option, {
        success: (res) => {
          if(res.statusCode === 200) {
            ok(res.data);
          }else if(res.statusCode === 404) {
            no(new Error('url resource not found!'));
          }else {
            no(res.data);
          }
        },
        fail: (error) => {
          no(baseUtils.handleRequestError(error));
        }
      }));
    });
  },
  /**
   * vue动态数据绑定视图[可刷新视图渲染]
   * @param oldData
   * @param newData
   */
  extendViewData: function (oldData, newData) {
    if(!newData) return;
    _each(newData, (value, key) => {
      this.$set(oldData, key, value);
    });
  },
  /**
   * 深度解码url
   * @param url
   * @returns {*}
   */
  decodeUrl: function (url) {
    if(decodeURIComponent(url) === url) {
      return url;
    }
    return this.$decodeUrl(decodeURIComponent(url));
  },
  /**
   * [初始化阶段]获取Ref组件实例
   * tips：为了兼容字节跳动在created和mounted生命周期内无法获取refs的BUG
   * @param vm
   * @param refName
   * @param cb
   */
  getInitRefInstance: function (vm, refName, cb) {
    // #ifdef MP-TOUTIAO
    setTimeout(() => {
      cb(vm.$refs[refName]);
    }, 200);
    // #endif
    // #ifndef MP-TOUTIAO
    vm.$nextTick(() => {
      cb(vm.$refs[refName]);
    });
    // #endif
  },
  /**
   * 获取页面路径从选择器数据
   * @param data 选择器数据
   * @param params 额外参数
   * @returns {string}
   */
  getPagePathWithPickerData: function (data, params = {}) {
    let path = data.value;
    if(path.indexOf('mine:') === 0) {
      const customArgs = [];
      _each(params, (value, key) => customArgs.push(`${key}=${value}`));
      const data = path.replace('mine:', '').split('@');
      const pageId = data[0];
      const args = data[1] ? `${data[1]}&${customArgs.join('&')}` : customArgs.join('&');
      path = '/pages/group-main/pages/web/index?id=' + pageId;
      if(args) path += '&args=' + encodeURIComponent(args);
    }else if(path.indexOf('buildIn:') === 0) {
      const data = path.replace('buildIn:', '').split('@');
      const group = data[0];
      const page = data[1];
      const args = data[2] || '';
      path = `/pages/${group}/pages/${page}/index`;
      if(args) path += args;
    }else if(path.indexOf('applet:') === 0) {
      const data = path.replace('applet:', '').split('@');
      const appId = data[0];
      const appPath = encodeURIComponent(data[1] || '');
      const extras = data[2] || '';
      path = `/pages/group-main/pages/applet/index?id=${appId}&ph=${appPath}&ext=${extras}`;
    }
    if(path.indexOf('mine:') !== 0
      && path.indexOf('applet:') !== 0) {
      _each(params, (value, key) => {
        const prefix = path.indexOf('?') > 0 ? '&' : '?';
        path += `${prefix}${key}=${value}`;
      });
    }
    return path;
  },
  /**
   * URL链接或对象中http转https
   * @param url
   * @return {*}
   */
  http2https: function (url) {
    if(!url) return null;
    if(_isObject(url) && url.url) {
      url.url = url.url.replace(/^http:/, 'https:');
      return url;
    }
    if(_isString(url)) {
      return url.replace(/^http:/, 'https:');
    }
    if(_isArray(url)) {
      const urls = [];
      url.forEach(item => {
        urls.push(app.http2https(item));
      });
      return urls;
    }
    return url;
  },
  /**
   * 查询节点信息
   * @param context
   * @param id
   */
  querySelectorData: function (context, id) {
    return new Promise((ok) => {
      id = id.indexOf('#') < 0 ? `#${id}` : id;
      const query = uni.createSelectorQuery().in(context);
      query.select(id).boundingClientRect(data => {
        ok(data);
      }).exec();
    });
  },
  /**
   * 获取当前页面完整路径
   * @return {*}
   */
  getCurrentPageFullPath: function () {
    return this.$getLastPageFullPath(0);
  },
  /**
   * 获取上一个页面完整路径
   * @param index 倒序索引[0表示当前页面]
   * @return {*}
   */
  getLastPageFullPath: function (index) {
    const currentPage = this.$getLastPageData(index);
    if(!currentPage) return null;
    let currentPath = `/${currentPage.route}`;
    const params = [];
    _each(currentPage.options, (value, key) => {
      if(key) params.push(`${key}=${value}`);
    });
    if(params.length > 0) currentPath += `?${params.join('&')}`;
    return currentPath;
  },
  /**
   * 获取上一个页面数据
   * @param index 倒序索引[0表示当前页面]
   * @return {*}
   */
  getLastPageData: function (index = 1) {
    return getCurrentPages().slice(-index - 1)[0];
  },
  /**
   * 重新加载当前页面
   * @return {*}
   */
  reloadCurrentPage: function () {
    // #ifdef H5
    location.replace(location.href);
    // #endif
    // #ifndef H5
    const currentPagePath = this.$getCurrentPageFullPath();
    uni.redirectTo({ url: currentPagePath, animationType: 'none' });
    // #endif
  },
  /**
   * 获取当前模板参数
   * tips: 此处强制异步处理是因为未来很可能会接入网络来获取模板数据
   */
  getExtParams: function () {
    return new Promise((ok) => {
      const ext = _cloneDeep(extData.ext);
      if(uni.app.macros.DEBUG) {
        ext.companyId = uni.app.macros.DEVCOMPANYID;
      }
      ext.wxAppId = uni.app.macros.WXAPPID;
      return ok(ext);
    });
  },
  /**
   * 取出路由取参数
   * @param vm
   * @param cb
   */
  fetchRouteQuery: function (vm, cb) {
    if(!vm) throw new Error('vm参数不能为空');
    if(!(vm instanceof Vue)) throw new Error('vm参数必须为vue实例');
    vm.$nextTick(() => this.sharedState.$innerFetchRouteQuery(cb));
  },
};

const $methods = {};
_each(methods, (value, key) => {
  $methods[`$${key}`] = value;
});

Vue.mixin({ methods: $methods });

export default methods;