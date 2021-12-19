<style lang="scss">
	@import '@/assets/styles/source';
	.layout-header{
		&.fill{box-sizing: content-box;}
		&.transparent .wrapper{background: transparent;}
		.wrapper{
			position: fixed;top: 0;left: 0;z-index: 99;
			width: 100%;color: #fff;box-sizing: content-box;
			&.default{background-color: #fff!important;color: #333;}
			.btns{width: rpx(90);}
			.back{padding-left: rpx(10);}
			.content{text-align: center;font-size: rpx(16);font-weight: 500;}
			.iconfont{font-size: rpx(16);text-shadow: rgba(#fff, 0.4) 1px 0 0;}
		}
	}
</style>

<template>
	<view
		class="layout-header"
		:class="{fill: fill && !transitionDisplay, transparent}"
		:style="{
			height: `${fill && !transitionDisplay ? headerHeight : 0}px`,
			paddingTop: `${!transitionDisplay ? safeOffsetTop : 0}px`,
		}">
		<view
			class="wrapper flex"
			:class="{theme: useThemeColor}"
			:style="{
				height: `${headerHeight}px`,
				lineHeight: `${headerHeight}px`,
				paddingTop: `${safeOffsetTop}px`,
				color: useThemeColor ? '#fff' : '#333',
				backgroundColor: hexColorWithOpacity(useThemeColor ? appTheme['primary-color'] : '#fff', transitionOpacity),
				boxShadow: `rgba(0,0,0, ${ transitionShadow }) 0 1px 3px`
			}">
			<view class="btns flex">
				<view
					v-if="showBackBtn"
					class="tag flex1 back"
					@click="onBackPage">
					<text class="iconfont">&#xe60a;</text>
				</view>
			</view>
			<view class="content flex1 ellipsis" :style="{opacity: transitionOpacity}">{{ title }}</view>
			<view class="btns"></view>
		</view>
	</view>
</template>

<script>
	import baseUtils from '@/assets/utils/base';

	export default {
		props: {
			//***页面标题
			title: {
				type: String,
				default: null
			},
			//***占位填充
			fill: {
				type: Boolean,
				default: true
			},
			//***透明的
			transparent: {
				type: Boolean,
				default: false
			},
			//***过渡显示
			transitionDisplay: {
				type: Boolean,
				default: false
			},
			//***过渡距离
			transitionDistance: {
				type: Number,
				default: 150
			},
			//***使用主题色
			useThemeColor: {
				type: Boolean,
				default: false
			},
			rootPage: {
				type: Boolean,
				default: false
			},
			scrollTop: {
				type: Number,
				default: 0
			},
		},
		data: function () {
			return {
				showBackBtn: !this.rootPage
					&& getCurrentPages().length > 1,
				appTheme: uni.app.theme,
				safeOffsetTop: uni.app.safeOffsetTop,
				headerHeight: uni.app.headerHeight,
				statusBarTint: false,
				transitionOpacity: this.transitionDisplay ? 0 : 1,
				transitionShadow: this.transitionDisplay ? 0 : 0.04,
			}
		},
		watch: {
			scrollTop: function (value) {
				if(!this.transitionDisplay) return;
				this.transitionOpacity = Math.max(Math.min(value / this.transitionDistance, 1), 0);
				this.transitionShadow = value > this.transitionDistance * 0.8 ? 0.04 : 0;
				this.changeStatusBarColor(this.transitionOpacity < 0.3);
			},
			transitionDisplay: function (value) {
				this.transitionOpacity = value ? 0 : 1;
				this.transitionShadow = value ? 0 : 0.04;
				this.changeStatusBarColor(value);
			},
			useThemeColor: function (value) {
				this.changeStatusBarColor(value);
			},
		},
		created: function () {},
		mounted: function () {
			this.initData();
		},
		methods: {
			//*********************************内置方法
			//***************************
			initData: function () {
				this.changeStatusBarColor(this.transitionDisplay || this.useThemeColor);
			},
			//**********改变状态栏颜色
			changeStatusBarColor: function (isTint) {
				if(isTint === this.statusBarTint) return;
				this.statusBarTint = isTint;
				uni.setNavigationBarColor({
					frontColor: isTint ? '#ffffff' : '#000000',
					backgroundColor: this.appTheme['primary-color'],
				});
			},
			//**********十六进制颜色添加透明度
			hexColorWithOpacity: function (color, opacity) {
				return baseUtils.hexColorWithOpacity(color, opacity);
			},

			//*********************************内置事件
			//***************************
			//**********返回页面
			onBackPage: function () {
				uni.navigateBack();
			}
		},
	}
</script>


