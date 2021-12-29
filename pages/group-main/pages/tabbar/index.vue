<style lang="scss">
  @import '@/assets/styles/source';
  .group-main-tabbar{

  }
</style>

<template>
  <page-layout
    class="modules group-main-tabbar"
    root-page
    :title="currentTitle"
    :use-theme-color="true">
    <view class="tabs" ref="tabs">
      <tab-home  ref="home" v-show="currentTab === 'home'" class="tab tab-home"/>
      <tab-category ref="category" v-show="currentTab === 'category'" class="tab tab-category"/>
      <tab-message ref="message" v-show="currentTab === 'message'" class="tab tab-message"/>
      <tab-cart ref="cart" v-show="currentTab === 'cart'" class="tab tab-cart"/>
      <tab-mine ref="mine" v-show="currentTab === 'mine'" class="tab tab-mine"/>
    </view>
    <module-tabbar class="module module-tabbar"/>
  </page-layout>
</template>

<script>
  import Vue from 'vue';
  import _isArray from 'lodash/isArray';
  import _isFunction from 'lodash/isFunction';
  import tabBarData from './data/tabbar';

  //**********************************************************************页面模块共享状态
  //**************************************************************
  //**************************************************************
  const sharedEvent = getApp().globalData.pageBus.groupMainTabbarEvent;
  const sharedStore = Object.assign(getApp().globalData.pageShares.groupMainTabbarStore, {
    state: {

    }
  });

  //**********************************************************************页面模块
  //**************************************************************
  //**************************************************************
  import pageLayout from '@/pages/@public/layout/layout';
  import moduleTabbar from './modules/tabbar.vue';
  import tabHome from '../tab-home/index';
  import tabCategory from '../tab-category/index';
  import tabMessage from '../tab-message/index';
  import tabCart from '../tab-cart/index';
  import tabMine from '../tab-mine/index';

  export default {
    mixins: [
      require('@/pages/@public/mixins/page').default,
    ],
    //**********************************************************************注册页面模块
    //**************************************************************
    //**************************************************************
    components: {
      pageLayout,
      moduleTabbar,
      tabHome,
      tabCategory,
      tabMessage,
      tabCart,
      tabMine,
    },
    data: function () {
      return {
        sharedEvent,
        sharedState: sharedStore.state,
        currentTab: null,
        currentTitle: null,
        scrollTop: 0,
      }
    },
    created: function () {
      sharedEvent.$on('changeTab', this.onChangeTab);
      this.initData();
    },
    destroyed: function () {
      sharedEvent.$off();
    },
    onPullDownRefresh: function () {
      this.callVisibleTab('onPullDownRefresh');
    },
    onReachBottom: function () {
      this.callVisibleTab('onReachBottom');
    },
    onPageScroll: function (data) {
      this.scrollTop = data.scrollTop;
    },
    methods: {
      //*********************************内置方法
      //***************************
      //**********初始数据
      initData: function () {

      },
      //**********重置数据
      resetData: function () {
        for(let $vm of this.getTabVmList()) {
          if($vm.resetData) $vm.resetData(...arguments);
        }
      },
      //**********获取标签组件列表
      getTabVmList: function () {
        // #ifdef H5
        return this.$refs.tabs.$children;
        // #endif
        // #ifndef H5
        const $vmList = [];
        tabBarData.forEach(item => {
          $vmList.push(this.$refs[item.value]);
        });
        return $vmList;
        // #endif
      },
      /**
       * 调用可见的标签选项方法
       * @param methodName
       * @param args
       */
      callVisibleTab: function (methodName, ...args) {
        for(let $vm of this.getTabVmList()) {
          if($vm._tabVisible) {
            if(_isArray($vm.$options[methodName])
              && _isFunction($vm.$options[methodName][0])) {
              $vm.$options[methodName].slice(-1)[0].apply($vm, args);
            }else if(_isFunction($vm.$options[methodName])) {
              $vm.$options[methodName].apply($vm, args);
            }
            break;
          }
        }
      },


      //*********************************内置事件
      //***************************
      //**********切换标签
      onChangeTab: function (value, detail) {
        uni.pageScrollTo({ scrollTop: 0, duration: 0 });
        this.lastTab = this.currentTab;
        this.currentTab = value;
        this.currentTitle = detail.title || detail.name;
        this.$nextTick(() => {
          for(let $vm of this.getTabVmList()) {
            if($vm.name.replace('tab-', '') === this.currentTab) {
              $vm._tabVisible = true;
              if($vm.$options.onVisible) $vm.$options.onVisible.call($vm, !$vm._tabLoad);
              if(!$vm._tabLoad) $vm._tabLoad = true;
            }
            if($vm.name.replace('tab-', '') === this.lastTab){
              $vm._tabVisible = false;
              if($vm.$options.onInVisible) $vm.$options.onInVisible.call($vm);
            }
          }
        });
      }
    },
  }
</script>

