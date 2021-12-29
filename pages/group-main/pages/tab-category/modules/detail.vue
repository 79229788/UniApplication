<style lang="scss">
  @import '@/assets/styles/source';
  .group-main-tab-category-detail{

  }
</style>

<template>
  <view class="group-main-tab-category-detail">
    我是分类页
  </view>
</template>

<script>
  import Vue from 'vue';

  const sharedEvent = getApp().globalData.pageBus.groupMainTabCategoryEvent;
  const sharedStore = getApp().globalData.pageShares.groupMainTabCategoryStore;
  export default {
    data: function () {
      return {
        sharedEvent,
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
