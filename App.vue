<style lang="scss">
  @import '@/assets/styles/common.scss';
</style>
<script>
  import Vue from 'vue';
  import moment from 'dayjs';
  import EventEmitter from '@/assets/utils/events';
  import Comber from '@/assets/libs/comber';
  import macros from '@/configs/macros';
  import defTheme from '@/configs/defTheme';
  import defSetting from '@/configs/defSetting';
  import pageMapData from './pages.map.js';

  import globalMethods from './pages/@public/mixins/global';
  import './pages/@public/mixins/lifecycle';
  import './pages/@public/filter/index';

  export default {
    globalData: Object.assign(macros, {
      debugLogs: null,
      groupBus: {},
      pageBus: {},
      pageShares: {}
    }),
    onLaunch: function(options) {
      this.initConfig(options);
      this.initData(options);
      this.checkAppletUpdate();
      this.log('应用已成功启动', uni.app.system);
    },
    onShow: function() {
      this.checkAppletUpdate();
    },
    onHide: function() {},
    methods: Object.assign({
      /**
       * 初始化数据
       */
      initData: function (options) {
        uni.app = this;
        uni.app.moment = moment;
        uni.app.macros = macros;
        uni.app.currentUser = this.$getCurrentUser();
        uni.app.theme = defTheme;
        uni.app.setting = defSetting;
        uni.app.system = uni.getSystemInfoSync();
        uni.app.platform = uni.app.system.platform;
        if(uni.app.platform === 'devtools') {
          uni.app.platform = uni.app.system.system
            .toLowerCase().indexOf('ios') >= 0 ? 'ios' : 'android';
        }
        uni.app.safeOffsetTop = (uni.app.system.safeArea || {}).top || uni.app.system.statusBarHeight || 0;
        uni.app.safeOffsetBottom = uni.app.system.screenHeight - ((uni.app.system.safeArea || {}).bottom || 0);
        uni.app.headerHeight = uni.app.platform === 'android' ? 48 : 44;
        uni.app.tabberHeight = 50;
        for(let key in pageMapData) {
          this.globalData.pageBus[`${key}Event`] = new EventEmitter();
          this.globalData.pageShares[`${key}Store`] = { state: {} };
        }
      },
      /**
       * 初始化配置
       */
      initConfig: function () {
        Comber.config = {
          engine: uni,
          apiUrl: macros.KAPIURL,
          debug: macros.DEBUG,
          storage: {
            clearSize: 4500,
          },
          alert: function (text) {
            return uni.app.toast(text);
          },
          headersHandler: function (headers) {
            headers.Sess = uni.getStorageSync('session');
            headers.Client = 'name';
            headers.Version = uni.app.macros.VERSION;
          },
          beforeGetHandler: function (opts) {
            if(opts.apiMode) {
              if(opts.apiService) opts.url += '/' + opts.apiService;
              if(opts.apiManager) opts.url += '/' + opts.apiManager;
              if(opts.apiMethod) opts.url += '/' + opts.apiMethod;
              if(opts.apiArgs) opts.url += '/' + encodeURIComponent(JSON.stringify(opts.apiArgs));
            }
            return opts;
          },
          beforePostHandler: function (opts) {
            const method = this.setAttr || this.set;
            if(opts.apiService) method.call(this, '__service', opts.apiService);
            if(opts.apiManager) method.call(this, '__manager', opts.apiManager);
            if(opts.apiMethod) method.call(this, '__method', opts.apiMethod);
          },
          dataHandler: function (data, type) {
            if(type === 'collection' && data.rows) {
              const collection = new this.constructor(data.rows);
              collection._data = data;
              return collection;
            }
          },
          onXHRError: (error) => {
            if(error.code === 10001) {
              this.log('请求被中断，登录已失效');
              this.clearCurrentUser();
              this.$redirectTo({
                path: 'auth@login',
                query: { point: encodeURIComponent(this.$getCurrentPageFullPath()) }
              });
            }
            if(error.code !== 'statusCode404') {
              this.toast(`[${error.code}] ${error.message}`);
            }
          }
        };
      },

    }, globalMethods)
  }
</script>

