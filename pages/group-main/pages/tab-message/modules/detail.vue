<style lang="scss">
  @import '@/assets/styles/source';
  .group-main-tab-message-detail{

  }
</style>

<template>
  <view class="group-main-tab-message-detail">
    我是消息页
  </view>
</template>

<script>
  import Vue from 'vue';

  const sharedEvent = getApp().globalData.pageBus.groupMainTabMessageEvent;
  const sharedStore = getApp().globalData.pageShares.groupMainTabMessageStore;
  export default {
    data: function () {
      return {
        sharedState: sharedStore.state,

      }
    },
    created: function () {
      this.initData();
    },
    mounted: function () {},
    methods: {
      //*********************************内置方法
      //***************************
      //**********初始数据
      initData: function () {

      },
      //**********重置数据
      resetData: function () {

        this.initData();
      },

      //*********************************内置事件
      //***************************

    }
  }
</script>
