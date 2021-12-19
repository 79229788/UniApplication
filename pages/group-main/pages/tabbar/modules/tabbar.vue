<style lang="scss">
  @import '@/assets/styles/source';
  .group-main-tabbar-tabbar{
    height: 50px;box-sizing: content-box;
    .wrapper{
      bottom: 0;height: 50px;background: #fff;box-sizing: content-box;
      @include box-shadow(blackColor(0.03) 0 -1px 6px);
      .item{
        text-align: center;color: $main-text3-color;
        &.selected{color: $main-color;}
        .iconfont{height: 20px;line-height: 20px;font-size: 23px;}
        .name{margin-top: 5px;height: 12px;line-height: 12px;font-size: 12px;}
      }
    }
  }
</style>

<template>
  <view class="group-main-tabbar-tabbar" :style="{paddingBottom: `${safeOffsetBottom}px`}">
    <view class="wrapper fixed80 flex" :style="{paddingBottom: `${safeOffsetBottom}px`}">
      <view
        class="item flex1 flex-c"
        v-for="(item, index) in tabList"
        :class="{selected: currentTab === item.value}"
        :key="index"
        @click="onChangeTab(index)">
        <view>
          <view class="iconfont">{{ item.icon }}</view>
          <view class="name">{{ item.name }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import Vue from 'vue';
  import baseUtils from '@/assets/utils/base';
  import _findIndex from 'lodash/findIndex';
  import tabBarData from '../data/tabbar';

  const sharedEvent = getApp().globalData.pageBus.groupMainTabbarEvent;
  const sharedStore = getApp().globalData.pageShares.groupMainTabbarStore;
  export default {
    data: function () {
      return {
        sharedEvent,
        sharedState: sharedStore.state,
        tabList: [],
        currentTab: null,
        appTheme: uni.app.theme,
        safeOffsetBottom: uni.app.safeOffsetBottom,
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
        const tabList = [];
        tabBarData.forEach(item => {
          tabList.push(item);
        });
        this.tabList = tabList;
        this.$nextTick(() => {
          this.sharedState.$fetchRouteQuery(query => {
            const currentTab = query.tab;
            const currentTabIndex = _findIndex(this.tabList,
              item => item.value === currentTab);
            this.onChangeTab(Math.max(0, currentTabIndex));
          });
        });
      },
      //**********重置数据
      resetData: function () {

        this.initData();
      },

      //*********************************内置事件
      //***************************
      //**********切换标签
      onChangeTab: function (index) {
        const item = this.tabList[index];
        if(this.currentTab === item.value) return;
        this.currentTab = item.value;
        // #ifdef H5
        baseUtils.replaceUrlHashParam('tab', item.value);
        // #endif
        sharedEvent.$emit('changeTab', item.value, item);
      }
    }
  }
</script>
