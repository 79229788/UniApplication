<style lang="scss">
  @import '@/assets/styles/source';
  .group-auth-login-form{

  }
</style>

<template>
  <view class="group-auth-login-form">

  </view>
</template>

<script>
  import Vue from 'vue';

  const sharedEvent = getApp().globalData.pageBus.groupAuthLoginEvent;
  const sharedStore = getApp().globalData.pageShares.groupAuthLoginStore;
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
