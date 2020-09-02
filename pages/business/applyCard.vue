<template>
	<view class="main">
		<view class="u-rela">
			<u-swiper name="eimgurl" height="400" border-radius="0" :list="data.img_list"></u-swiper>
			<view class="grid">
				<u-grid :col="3" :border="false">
					<u-grid-item v-for="(item,i) in grid" :key="i" @click="openUrl(item.value,i)">
						<u-image  width="60rpx" height="60rpx" @click="openUrl(item.value,i)" :src="item.icon"></u-image>
						<text class="u-font-13 u-margin-top-15">{{item.title}}</text>
					</u-grid-item>
				</u-grid>
			</view>
		</view>
		<view class="u-flex u-row-between u-col-center order ">
			<view class="u-text-center u-flex-1">
				<view><text class="order-number">{{data.total_order}}</text></view>
				<view><text class="u-font-28">累计订单</text></view>
			</view>
			<view class="u-text-center u-flex-1">
				<view><text class="order-number">{{data.check_order}}</text></view>
				<view><text class="u-font-28">办卡分润</text></view>
			</view>
		</view>
		<view class="u-padding-30 u-margin-top-20">
			<view class="u-font-36 font-blod"><text>卡神推荐</text></view>
			<view class="ks">
				<u-image border-radius="10"  @click="toWebView(data.ks_recom.lid)" class="u-margin" width="100%" height="300rpx" mode="widthFix" :src="data.ks_recom.imgurl"></u-image>
			</view>
		</view>
		<u-gap height="20" bg-color="#F2F2F2"></u-gap>
		<view class="u-padding-30">
			<view class="u-font-36 font-blod"><text>热门银行</text></view>
			<u-grid :col="3" :border="false">
				<u-grid-item v-for="(item,i) in data.hot" :key="i" @click="toWebView(item.lid)">
					<u-image shape="circle" width="70rpx" height="70rpx" @click="toWebView(item.lid)" :src="item.logourl"></u-image>
					<text class="u-font-28 u-margin-top-15">{{item.name}}</text>
				</u-grid-item>
			</u-grid>
		</view>
		<u-gap height="20" bg-color="#F2F2F2"></u-gap>
		<view class="u-padding-30">
			<view class="u-font-36 font-blod"><text>热卡排行</text></view>
			<view @click="toWebView(item.lid)" class="hot-item u-flex u-col-top u-row-between u-padding-top-20 u-padding-bottom-20"
			 v-for="(item,index) in data.hot_recom" :key="index">
				<view>
					<u-image @click="toWebView(item.lid)" width="250rpx" height="160rpx" :src="item.imgurl"></u-image>
				</view>
				<view class="u-flex-1 u-margin-left-40 info">
					<view><text class="u-font-28 font-blod">{{item.name}}</text></view>
					<view class="u-margin-top-30"><text class="u-font-24 u-type-info">{{item.description}}</text></view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'
	export default {
		computed: { ...mapState(['hasLogin', 'userInfo'])
		},
		data() {
			return {
				data: {
					ks_recom: {}
				},
				grid: [{
						value: '',
						icon: 'https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-08-04/5f2922fccd15e.png',
						title: '我的账户'
					},
					{
						value: '',
						icon: 'https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-08-04/5f2923115911d.png',
						title: '申请记录'
					},
					{
						value: '',
						icon: 'https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-08-04/5f29231e6c2f2.png',
						title: '奖励规则'
					}
				]
			};
		},
		onLoad() {
			this.initData()
		},
		onPullDownRefresh() {
			this.initData()
		},
		methods: {
			async initData() {
				let res = await this.http.request({
					api_source: 'app',
					uri: '/CreditList/credit_list',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
					}
				})
				if (res.data.status == 1) {
					this.data = res.data.body
					this.grid[2].value = res.data.body.award_url
				}else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
				uni.stopPullDownRefresh()
			},
			openUrl(url, index) {
				switch (index) {
					case 0:
						uni.navigateTo({
							url: 'account'
						})
						break;
					case 1:
						uni.navigateTo({
							url: 'record'
						})
						break;
					case 2:
						uni.navigateTo({
							url: '../public/webView?url=' + url + '&source=' + '../business/applyCard'
						})
						break;
					default:
						break;
				}

			},
			toWebView(bid) {
				let sign = this.http.banksign({
					bankid: bid,
					device: 'web',
					uid: this.userInfo.uid
				}, '/Credit/application_bank_submit')
				let url = sign.url + '&bankid=' + sign.data.bankid + '&uid=' + sign.data.uid
				uni.navigateTo({
					url: '../public/webView?url=' + encodeURIComponent(url) + '&source=' + '../business/applyCard'
				})
			}
		}
	}
</script>

<style lang="scss">
	.u-swiper-indicator {
		bottom: 20px !important;
	}

	.grid {
		position: absolute;
		top: 370rpx;
		left: 30rpx;
		right: 30rpx;
		border-radius: 20rpx;
		background: #FFF;
		overflow: hidden;
		box-shadow: 0rpx 10rpx 10rpx #F2F2F2;
	}

	.order {
		margin-top: 200rpx;

		.order-number {
			font-size: 48rpx;
			font-weight: bold;
		}
	}

	.ks {
		background: #FFF6E9;
		height: 300rpx;
		overflow: hidden;
		border-radius: 10rpx;
		margin: 20rpx 0;
		box-shadow: 10rpx 10rpx 10rpx #F2F2F2;
	}

	.hot-item {
		border-bottom: 1px solid #F2F2F2;

		.info {}
	}
</style>
