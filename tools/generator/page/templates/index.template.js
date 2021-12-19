<style lang="scss">
  @import '@/assets/styles/source';
  .<%=pageFullKebabName%>{

  }
</style>

<template>
  <page-layout class="modules <%=pageFullKebabName%>" title="<%=titleName%>">
    <module-<%=moduleKebabName%> class="module module-<%=moduleKebabName%>"/>
  </page-layout>
</template>

<script>
  import Vue from 'vue';

  //**********************************************************************页面模块共享状态
  //**************************************************************
  //**************************************************************
  const sharedEvent = getApp().globalData.pageBus.<%=pageFullCamelName%>Event;
  const sharedStore = Object.assign(getApp().globalData.pageShares.<%=pageFullCamelName%>Store, {
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
  import module<%=moduleCamelNameFirstUpper%> from './modules/<%=moduleKebabName%>';

  export default {
    mixins: [
      require('@/pages/@public/mixins/page').default,
    ],
    //**********************************************************************注册页面模块
    //**************************************************************
    //**************************************************************
    components: {
      pageLayout,
      module<%=moduleCamelNameFirstUpper%>,
    },
    data: function () {
      return {
        sharedEvent,
        sharedState: sharedStore.state,

      }
    },
    created: function () {
      this.initData();
    },
    destroyed: function () {
      sharedStore.resetData();
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

