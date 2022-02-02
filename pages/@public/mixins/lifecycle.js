/**
 * 将页面生命周期传递给页面模块
 *
 * -.不支持多层传递
 * -.不支持传递onLoad以及需要return的生命周期方法
 * -.onShow方法仅在模块实例化后调用（即首次不会调用）
 */
import Vue from 'vue';

const lifeMethodNames = [
  'onReady', 'onShow', 'onHide', 'onUnload', 'onResize', 'onPullDownRefresh', 'onReachBottom',
  'onTabItemTap', 'onPageScroll', 'onNavigationBarButtonTap',
  'onNavigationBarSearchInputChanged', 'onNavigationBarSearchInputConfirmed',
  'onNavigationBarSearchInputClicked', 'onAddToFavorites',
];

const mixin = {
  created: function () {
    if(!this.__rootPage && this.sharedEvent) {
      lifeMethodNames.forEach(name => {
        this.sharedEvent.$on(name, (...args) => {
          if(name === 'onShow') this.$resetPageHandler();
          if(!this.onPageEvents) return;
          this.onPageEvents(name, ...args);
        });
      });
    }
  },
  onLoad: function (query) {
    this.__rootPage = true;
    this.$fetchRouteQueryHandler(query);
  },
  methods: {
    //**********路由取参数处理
    $fetchRouteQueryHandler: function (query) {
      this.$innerFetchRouteQuery = function handler(cb) {
        uni.app.loading();
        uni.app.fetchLaunchQueryData(query).then(query => {
          uni.app.hideLoading();
          cb(query);
        }).catch(error => {
          uni.app.hideLoading();
          uni.app.logError('$innerFetchRouteQuery', error);
          uni.app.alertLoadError(error, () => handler(...arguments))
        });
      };
      if(this.sharedState) {
        this.sharedState.$innerFetchRouteQuery = this.$innerFetchRouteQuery;
      }
    },
    //**********获取页面布局实例
    $getPageLayout: function () {
      const $firstChild = (this.$children || [])[0];
      if($firstChild && $firstChild.$options.name === 'layout') {
        return $firstChild;
      }
      return null;
    },
    //**********处理重设页面
    $resetPageHandler: function () {
      const currentPage = this.$getLastPageData(0);
      const currentPath = `/${currentPage.route}`;
      const resetData = (uni._resetPages || {})[currentPath];
      if(!resetData) return;
      if(!this.resetData) return;
      resetData.forEach(item => {
        this.resetData(item.scene, item.data);
      });
      setTimeout(() => {
        delete uni._resetPages[currentPath];
      }, 0);
    }
  },
};

lifeMethodNames.forEach(name => {
  mixin[name] = function (...args) {
    const $layout = this.$getPageLayout();
    if($layout && $layout.onPageEvents) {
      $layout.onPageEvents(name, ...args);
    }
    if(this.sharedEvent) {
      this.sharedEvent.$emit(name, ...args);
    }
  };
});

Vue.mixin(mixin);
