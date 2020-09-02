<template>
	<view class="main">
		<u-navbar height="50" back-icon-color="black" :border-bottom="false" :background="{backgroundImage:'linear-gradient(270deg, rgba(255, 186, 0, 1), rgba(255, 207, 0, 1))'}"
		 title="我的钱包" title-color="black" back-icon-size="36">
			<navigator slot="right" class="u-margin-right-20 u-font-30" url="bill?source=bill">账单详情</navigator>
		</u-navbar>
		<view class="head">
			<view><text class="u-font-24">总收入（元）</text></view>
			<view>
				<text class="u-font-28">￥</text>
				<text class="total-price">{{data.all_income}}</text>
			</view>
			<view class="u-flex u-row-between u-margin-top-50">
				<view class="u-flex-1">
					<view><text class="u-font-28">昨日收入（元）</text></view>
					<view class="u-margin-top-20"><text class="font-blod dat-price" style="color: #FF6666;">{{data.before_income}}</text></view>
				</view>
				<view class="u-flex-1">
					<view><text class="u-font-28">今日收入（元）</text></view>
					<view class="u-margin-top-20"><text class="font-blod dat-price">{{data.today_income}}</text></view>
				</view>
			</view>
		</view>
		<view class="amount white-bg u-flex u-row-between u-col-center">
			<view>
				<text class="u-font-28 u-type-info">可用余额(元)</text>
				<text class="u-margin-left-20 font-blod u-font-32">￥{{data.amount}}</text>
			</view>
			<view>
				<u-button @click="jump('withdraw')" :custom-style="{fontSize:'28rpx',padding:'0 30rpx'}" size="mini">提现</u-button>
				<u-button @click="jump('recharge')" :hair-line="false" :custom-style="czStyle" size="mini">充值</u-button>
			</view>
		</view>
		<u-gap bg-color="#F2F2F2" height="20"></u-gap>
		<u-cell-group :border="false">
			<u-cell-item @click="jump('',item)" :title-style="titleStyle" :center="true" :title="item.param_name" v-for="(item,index) in model"
			 :key="index">
				<u-image slot="icon" width="60" height="60" :src="item.param_img"></u-image>
			</u-cell-item>
		</u-cell-group>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	export default {
		data() {
			return {
				data: {},
				model: [],
				czStyle: {
					padding: '0 30rpx',
					border: 'none',
					color: '#FFF',
					marginLeft: '40rpx',
					fontSize: '28rpx',
					backgroundImage: 'linear-gradient(270deg, rgba(255, 186, 0, 1), rgba(255, 207, 0, 1))'
				},
				titleStyle: {
					fontSize: '32rpx',
					marginLeft: '30rpx',
					color: '#030400'
				}
			};
		},
		onLoad() {

		},
		onShow() {
			this.initData()
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		onPullDownRefresh() {
			this.initData()
		},
		methods: {
			async initData() {
				let res = await this.http.request({
					api_source: 'app',
					uri: '/Member/wallet',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid
					}
				})
				if (res.data.status == 1) {
					this.data = res.data.body
					this.model = res.data.body.model_info
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
				uni.stopPullDownRefresh();
			},
			jump(url, item) {
				if (url) {
					uni.navigateTo({
						url: url
					})
				} else {
					switch (item.param_id) {
						case '34':
							uni.navigateTo({
								url: '../gathering/performance?source=34'
							})
							break;
						case '73':
							uni.navigateTo({
								url: '../gathering/gathering'
							})
							break;
						case '74':
							uni.navigateTo({
								url: '../card/card'
							})
							break;
						case '75':
							uni.navigateTo({
								url: '../friend/transfer'
							})
							break;
						case '76':
							uni.navigateTo({
								url: '../business/applyCard'
							})
							break;
						case '77':
							uni.navigateTo({
								url: '../public/webView?url=' + item.param_url
							})
							break;
						default:
							break;
					}
				}

			}
		}
	}
</script>

<style lang="scss">
	page {
		background: $gray-bg;
	}

	.head {
		background: linear-gradient(270deg, rgba(255, 186, 0, 1), rgba(255, 207, 0, 1));
		color: #030400;
		padding: 50rpx 30rpx 40rpx 30rpx;

		.total-price {
			font-size: 72rpx;
			font-weight: bold;
		}

		.dat-price {
			font-size: 50rpx;
		}
	}

	.amount {
		padding: 30rpx;

	}
</style>
