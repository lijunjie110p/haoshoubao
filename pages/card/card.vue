<template>
	<view class="main">
		<view class="tabs">
			<u-tabs :is-scroll="false" ref="uTabs" bar-width="80" inactive-color="#999" bar-height="6" bg-color="#F6F6F6" height="90"
			 name="name" duration="0.3" active-color="#FFBA37" :list="tablist" :current="tabsIndex" @change="changeNavbar"></u-tabs>
		</view>
		<view>
			<view class="nocard" v-if="card.length==0" @click="addCard()">
				<view class="addbtn">
					<u-icon name="plus" size="30" color="#FFF"></u-icon>
					<text class="u-font-32 u-margin-left-10">{{card_type=='CC'?'添加信用卡':'添加储蓄卡'}}</text>
				</view>
			</view>
			<view class="hascard" v-else>
				<view v-if="card_type=='CC'">
					<view @click="details(item.card_id)" class="card" v-for="(item,index) in card" :key="index">
						<view class="u-flex u-col-center">
							<view>
								<u-image width="70rpx" height="70rpx" mode="aspectFit" :src="item.bank_icon"></u-image>
							</view>
							<view class="u-margin-left-35">
								<view><text class="u-font-28">{{item.bank_name}}</text></view>
								<view><text class="u-font-22">{{item.card_type=='CC'?'信用卡':'储蓄卡'}}</text></view>
							</view>
						</view>
						<view class="u-margin-top-40 u-flex u-row-right">
							<text class="font-blod u-font-40">{{item.card_no}}</text>
						</view>
					</view>
					<view class="botttom-addbtn" @click="addCard()">
						<u-icon name="plus" size="30" color="#FFF"></u-icon>
						<text class="u-font-32 u-margin-left-10">{{card_type=='CC'?'添加信用卡':'添加储蓄卡'}}</text>
					</view>
				</view>
				<view v-if="card_type=='DC'">
					<view class="cash-card" @click="details(data.card_id)" :style="{background:data.bank_background_color}" v-for="(data,index) in card" :key="index">
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
							<u-image @click="details(data.card_id)"  :lazy-load="false" width="150rpx" height="150rpx" mode="aspectFit" :src="data.bank_background_img"></u-image>
						</view>
					</view>
					<view class="botttom-addbtn" @click="addCard()">
						<u-icon name="plus" size="30" color="#FFF"></u-icon>
						<text class="u-font-32 u-margin-left-10">{{card_type=='CC'?'添加信用卡':'添加储蓄卡'}}</text>
					</view>
				</view>

			</view>

		</view>
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
				tabsIndex: 0,
				tablist: [{
						name: '信用卡'
					},
					{
						name: '储蓄卡'
					}
				],
				card: [],
				insurance: '',
				first:true,
			};
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		onLoad() {
		
		},
		onShow() {
				this.initData()
		},
		onPullDownRefresh() {
			this.initData()
		},
		methods: {
			changeNavbar(index) {
				this.card = [],
					this.tabsIndex = index;
				switch (index) {
					case 0:
						this.card_type = 'CC'
						break;
					case 1:
						this.card_type = 'DC'
						break;
					default:
						break;
				}
				this.initData()
			},
			async initData() {
				uni.showLoading({
					mask: true, 
					title: ''
				})
				let res = await this.http.request({
					api_source: 'app',
					uri: '/PayBank/card_holder',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
						card_type: this.card_type
					}
				})
				if (res.data.status == 1) {
					this.card = res.data.body.card
				}else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
				uni.stopPullDownRefresh();
				uni.hideLoading()
			},
			addCard() {
				if (this.card_type == 'CC') {
					uni.navigateTo({
						url: 'applyCredit'
					})
				} else if (this.card_type == 'DC') {
					uni.navigateTo({
						url: 'applyCash'
					})
				}
			},
			details(id) {
				uni.navigateTo({
					url: 'details?card_id=' + id
				})
			}
		}
	}
</script>

<style lang="scss">
	.tabs {
		background: #F6F6F6;
		padding: 0 30rpx;
	}

	.nocard {
		margin: 20rpx 30rpx;
		box-shadow: 8px 2px 12px 0px rgba(189, 189, 189, 0.35), -8px 2px 12px 0px rgba(189, 189, 189, 0.35);
		border-radius: 20rpx;
		background: #FFF;
		height: 280rpx;
		display: flex;
		justify-content: center;
		align-items: center;

		.addbtn {
			width: 380rpx;
			height: 90rpx;
			line-height: 90rpx;
			text-align: center;
			border-radius: 50rpx;
			background: linear-gradient(270deg, rgba(255, 186, 0, 1), rgba(255, 207, 0, 1));
			color: #FFF;
		}
	}

	.hascard {
		padding: 0 30rpx 50rpx 30rpx;
		background: #FFF;

		.card {
			margin: 30rpx 0;
			padding: 40rpx 50rpx;
			box-shadow: 8px 2px 12px 0px rgba(189, 189, 189, 0.35), -8px 2px 12px 0px rgba(189, 189, 189, 0.35);
			border-radius: 20rpx;
		}
	}

	.botttom-addbtn {
		width: 600rpx;
		height: 90rpx;
		line-height: 90rpx;
		text-align: center;
		border-radius: 50rpx;
		margin: 50rpx auto;
		background: linear-gradient(270deg, rgba(255, 186, 0, 1), rgba(255, 207, 0, 1));
		color: #FFF;
	}
	.cash-card {
		margin: 30rpx 0;
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
</style>
