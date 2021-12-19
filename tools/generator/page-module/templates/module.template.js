<style lang="scss">
  @import '@/assets/styles/source';
  .<%=moduleFullKebabName%>{

  }
</style>

<template>
  <view class="<%=moduleFullKebabName%>">

  </view>
</template>

<script>
  import Vue from 'vue';

  const sharedEvent = getApp().globalData.pageBus.<%=pageFullCamelName%>Event;
  const sharedStore = getApp().globalData.pageShares.<%=pageFullCamelName%>Store;
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
    methods: {
      //*********************************内置方法
      //***************************
      //**********初始数据
      initData: function () {

      },
      //**********重置数据
      resetData: function (scene, data) {

        if(!scene) this.initData();
      },

      //*********************************内置事件
      //***************************

    }
  }
</script>
