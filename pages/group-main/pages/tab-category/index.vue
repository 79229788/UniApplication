<style lang="scss">
  @import '@/assets/styles/source';
  .group-main-tab-category{

  }
</style>

<template>
  <view class="modules group-main-tab-category">
    <module-detail class="module module-detail"/>
  </view>
</template>

<script>
  import Vue from 'vue';

  //**********************************************************************页面模块共享状态
  //**************************************************************
  //**************************************************************
  const sharedEvent = getApp().globalData.pageBus.groupMainTabCategoryEvent;
  const sharedStore = Object.assign(getApp().globalData.pageShares.groupMainTabCategoryStore, {
    state: {

    }
  });

  //**********************************************************************页面模块
  //**************************************************************
  //**************************************************************
  import moduleDetail from './modules/detail.vue';

  export default {
    //**********************************************************************注册页面模块
    //**************************************************************
    //**************************************************************
    components: {
      moduleDetail,
    },
    data: function () {
      return {
        name: 'tab-category',
        sharedState: sharedStore.state,

      }
    },
    created: function () {
      this.initData();
    },
    destroyed: function () {
      sharedEvent.$off();
    },
    onVisible: function (first) {
      uni.app.log(`已进入[${this.name}]`, first ? '(首次)' : '');
      sharedEvent.$emit('visible', first);
    },
    onInVisible: function () {
      sharedEvent.$emit('inVisible');
    },
    onReachBottom: function () {
      uni.app.log(`[${this.name}]滑到底部`);
      sharedEvent.$emit('reachBottom');
    },
    onPullDownRefresh: function () {
      uni.app.log(`[${this.name}]开始下拉刷新`);
      sharedEvent.$emit('pullDownRefresh');
    },
    methods: {
      //*********************************内置方法
      //***************************
      //**********初始数据
      initData: function () {

      },

      //*********************************内置事件
      //***************************

    },
  }
</script>

