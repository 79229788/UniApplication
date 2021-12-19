<style lang="scss">
  @import '@/assets/styles/source';
  .group-auth-login{

  }
</style>

<template>
  <page-layout class="modules group-auth-login" :show-header="false">
    <module-form class="module module-form"/>
  </page-layout>
</template>

<script>
  import Vue from 'vue';

  //**********************************************************************页面模块共享状态
  //**************************************************************
  //**************************************************************
  const sharedEvent = getApp().globalData.pageBus.groupAuthLoginEvent;
  const sharedStore = Object.assign(getApp().globalData.pageShares.groupAuthLoginStore, {
    state: {

    },
    //**********重置数据
    resetData: function() {
      this.state = JSON.parse(JSON.stringify(sharedStateClone));
    },
  });
  const sharedStateClone = JSON.parse(JSON.stringify(sharedStore.state));

  //**********************************************************************页面模块
  //**************************************************************
  //**************************************************************
  import pageLayout from '@/pages/@public/layout/layout';
  import moduleForm from './modules/form.vue';

  export default {
    mixins: [
      require('@/pages/@public/mixins/page').default,
    ],
    //**********************************************************************注册页面模块
    //**************************************************************
    //**************************************************************
    components: {
      pageLayout,
      moduleForm,
    },
    data: function () {
      return {
        sharedState: sharedStore.state,

      }
    },
    created: function () {
      this.initData();
    },
    destroyed: function () {
      sharedEvent.$off();
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

