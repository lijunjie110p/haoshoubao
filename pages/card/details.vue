<template>
	<view class="main">
		<view style="background: #FFF;">
			<view class="card" :style="{background:data.bank_background_color}">
				<view class="u-flex u-col-center">
					<view class="icon">
						<u-image width="70rpx" height="70rpx" mode="aspectFit" :src="data.bank_icon"></u-image>
					</view>
					<view class="u-margin-left-35">
						<view><text class="u-font-28">{{data.bank_name}}</text></view>
						<view><text class="u-font-22">{{data.card_type=='CC'?'信用卡':'储蓄卡'}}</text></view>
					</view>
				</view>
				<view class="u-margin-top-20 u-flex u-row-right">
					<text class="font-blod u-font-40">{{data.card_no}}</text>
				</view>
				<view class="bgimg">
					<u-image :lazy-load="false" width="150rpx" height="150rpx" mode="aspectFit" :src="data.bank_background_img"></u-image>
				</view>
			</view>
		</view>

		<view class="price">
			<view class="u-flex u-row-between u-padding-30">
				<text class="u-main-color">单笔限额</text>
				<text class="u-type-info">￥{{data.bank_once_position}}</text>
			</view>
			<u-line color="#E8E8E8" />
			<view class="u-flex u-row-between u-padding-30">
				<text class="u-main-color">每日限额</text>
				<text class="u-type-info">￥{{data.bank_day_position}}</text>
			</view>
		</view>
		<u-gap height="20" bg-color="#F2F2F2"></u-gap>
		<view class="unbind" @click="showModel=true"><text>解除绑定</text></view>
		<u-modal :show-cancel-button="true" v-model="showModel" @confirm="unbind" content="是否解除绑定"></u-modal>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	export default {
		data() {
			return {
				card_type: 'CC',
				data: {},
				showModel: false,
			};
		},
		onLoad(parms) {
			this.card_id = parms.card_id;
				this.initData()
		},
		onPullDownRefresh() {
			this.initData()
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		
		methods: {
			async initData() {
				uni.showLoading({
					mask: true,
					title: ''
				})
				let res = await this.http.request({
					api_source: 'app',
					uri: '/PayBank/card_info',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
						card_id: this.card_id
					}
				})
				if (res.data.status == 1) {
					this.data = res.data.body.card_info
				}else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
				uni.stopPullDownRefresh();
				uni.hideLoading()
			},
			async unbind() {
				uni.showLoading({
					mask: true,
					title: ''
				})
				console.log(this.card_id)
				let res = await this.http.request({
					api_source: 'app',
					uri: '/PayBank/unbind_card',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
						card_id: this.card_id
					}
				})
				uni.hideLoading()
				if (res.data.status == 1) {
					this.$u.toast('解绑成功')
					uni.navigateBack();
				}else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}

			}
		}
	}
</script>

<style lang="scss">
	page {
		background: #F2F2F2;
	}

	.card {
		margin: 30rpx;
		padding: 30rpx 40rpx;
		border-radius: 20rpx;
		color: #FFF;
		position: relative;

		.icon {
			background: #FFFFFF;
			border-radius: 50rpx;
			padding: 5rpx;
		}

		.bgimg {
			position: absolute;
			right: 50rpx;
			width: 150rpx;
			top: 30rpx;
			bottom: 30rpx;
			background: transparent;
			.u-image{
				background: transparent;
			}
		}
	}

	.price {
		background: #FFF;
		margin-top: 50rpx;
	}

	.unbind {
		height: 90rpx;
		line-height: 90rpx;
		color: #FB3034;
		font-size: 36rpx;
		text-align: center;
		background: #FFF;
	}
</style>
