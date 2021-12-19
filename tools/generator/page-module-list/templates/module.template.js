<style lang="scss">
  @import '@/assets/styles/source';
  .<%=moduleFullKebabName%>{
    .list-view{
      .item{
        background: #fff;
        &.no-data{padding: rem(15);}
      }
    }
  }
</style>

<template>
  <view class="<%=moduleFullKebabName%>">
    <view class="wrapper">
      <view class="list-view">
        <!-- 首次加载中 -->
        <template v-if="list.data === null">
          <view class="item no-data">
            <u-skeleton avatar rows="3"/>
          </view>
        </template>
        <!-- 数据不存在 -->
        <template v-else-if="list.data.length === 0">
          <view class="ui-data-empty">暂无相关内容</view>
        </template>
        <template v-else>
          <view
            class="item"
            v-for="(item, index) in list.data"
            :key="index"
            @click="onSelectItem(index)">

          </view>
        </template>
      </view>
    </view>
  </view>
</template>

<script>
  import Vue from 'vue';
  import { MDObject, MCObject } from '@/assets/data/models/MDObject';

  const sharedEvent = getApp().globalData.pageBus.<%=pageFullCamelName%>Event;
  const sharedStore = getApp().globalData.pageShares.<%=pageFullCamelName%>Store;
  export default {
    data: function () {
      return {
        sharedEvent,
        sharedState: sharedStore.state,
        list: {
          data: null,
          pageSize: 20,
          nextToken: null,
        },
        searchData: {},
        moreLoading: null,
        refreshLoading: null,
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
        if(!scene) {
          this.list.data = null;
          this.list.nextToken = null;
          this.moreLoading = null;
          this.refreshLoading = null;
          this.initData();
        }
      },
      //**********取出列表数据
      fetchListData: function (action) {
        if(action !== 'refresh') uni.app.$loading();
        if(action === 'more') this.moreLoading = true;
        if(action === 'refresh') this.refreshLoading = true;
        //网络取出数据
        (new MCObject()).fetch({
          url: '',
          apiMode: true,
          apiService: '',
          apiMethod: '',
          apiArgs: {
            pageSize: this.list.pageSize,
            nextToken: this.list.nextToken,
            searchData: this.searchData,
          },
        }).then(collection => {
          this.list.nextToken = collection._data.nextToken;
          const list = collection.models
            .map(model => this.handleListItemData(model));
          if(action === 'more') {
            this.list.data = this.list.data.concat(list);
          }else {
            this.list.data = list;
            uni.pageScrollTo({ scrollTop: 0, duration: 0 });
          }
          this.moreLoading = false;
          this.refreshLoading = false;
          uni.stopPullDownRefresh();
          this.$nextTick(() => uni.app.$hideLoading());
        }).catch(error => {
          this.moreLoading = false;
          this.refreshLoading = false;
          uni.stopPullDownRefresh();
          uni.app.$hideLoading();
          uni.app.alertLoadError(error);
          uni.app.logError('fetchListData', error);
        });
      },
      //**********处理列表条目数据
      handleListItemData: function (model) {

        return model.toOrigin();
      },

      //*********************************内置事件
      //***************************
      //**********页面事件
      onPageEvents: function (type) {
        //*****加载更多
        if(type === 'onReachBottom') {
          if(this.moreLoading) return;
          if(!this.list.nextToken) return this.moreLoading = null;
          this.fetchListData('more');
        }
        //*****下拉刷新数据
        if(type === 'onPullDownRefresh') {
          if(this.refreshLoading) return;
          this.list.nextToken = null;
          this.moreLoading = null;
          this.fetchListData('refresh');
        }
      },
      //**********搜索数据
      onSearchData: function (data) {
        this.searchData = data;
        this.list.nextToken = null;
        this.moreLoading = null;
        this.fetchListData('search');
      },
      //**********选择列表条目
      onSelectItem: function (index) {
        const item = new MDObject(this.list.data[index]);

      }
    }
  }
</script>
