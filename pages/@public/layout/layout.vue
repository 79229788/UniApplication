<style lang="scss">
	@import '@/assets/styles/source';
	.page-layout{

	}
</style>

<template>
	<view class="page-layout">
		<layout-header
			v-if="showHeader"
			class="layout-header"
			:title="title"
			:use-theme-color="useThemeColor"
			:root-page="rootPage"
			:scroll-top="scrollTop"
			:fill="headerFill"
			:transparent="headerTransparent"
			:transition-display="headerTransitionDisplay"
			:transition-Distance="headerTransitionDistance"/>
		<slot></slot>
	</view>
</template>

<script>
	import layoutHeader from './header';
	import { MDUser } from '@/assets/data/models/MDUser';

	export default {
		name: 'layout',
		components: {
			layoutHeader,
		},
		props: {
			//***页面标题
			title: {
				type: String,
				default: null
			},
			//***使用主题色
			useThemeColor: {
				type: Boolean,
				default: false
			},
			//***是否为根页面[泛指启动的tabBar页]
			rootPage: {
				type: Boolean,
				default: false
			},
			scrollTop: {
				type: Number,
				default: 0
			},
			//***显示页头
			showHeader: {
				type: Boolean,
				default: true
			},
			//***页头占位填充
			headerFill: {
				type: Boolean,
				default: true
			},
			//***页头透明的
			headerTransparent: {
				type: Boolean,
				default: false
			},
			//***页头过渡显示
			headerTransitionDisplay: {
				type: Boolean,
				default: false
			},
			//***页头过渡距离
			headerTransitionDistance: {
				type: Number,
				default: 150
			},
			//***开启授权
			enableAuth: {
				type: Boolean,
				default: false
			},
		},
		data: function () {
			return {

			}
		},
		created: function () {
			this.initData();
		},
		methods: {
			//*********************************内置方法
			//***************************
			initData: function () {

			},

			//*********************************内置事件
			//***************************
			//**********页面事件
			onPageEvents: function (type) {

			},
		},
	}
</script>


