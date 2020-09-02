<template>
	<view class="main">
		<view class="hascard">
			<view v-if="card_type=='CC'">
				<view @click="selectCard(item,index)" class="card" v-for="(item,index) in card" :key="index">
					<view class="select-icon">
						<u-icon v-if="selectIndex == index" name="checkmark-circle-fill" size="50" color="#FFBA37"></u-icon>
						<u-icon v-else name="checkmark-circle" size="50" color="#FFBA37"></u-icon>
					</view>
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

			</view>
			<view v-if="card_type=='DC'">
				<view class="cash-card" @click="selectCard(data,index)" :style="{background:data.bank_background_color}" v-for="(data,index) in card"
				 :key="index">
					<view class="select-icon">
						<u-icon v-if="selectIndex == index" name="checkmark-circle-fill" size="50" color="#FFBA37"></u-icon>
						<u-icon v-else name="checkmark-circle" size="50" color="#FFBA37"></u-icon>
					</view>
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
						<u-image @click="selectCard(data,index)" :lazy-load="false" width="150rpx" height="150rpx" mode="aspectFit" :src="data.bank_background_img"></u-image>
					</view>
				</view>
			</view>
		</view>
		<u-gap height="150" bg-color="#FFF"></u-gap>
		<view class="botttom-addbtn" @click="details">
			<text class="u-font-32 u-margin-left-10">确认</text>
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
				card_type: '', //CC信用卡 DC储蓄卡
				card: [],
				source: '',
				selectIndex: 0,
				selectData: null
			};
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		onLoad(parms) {
			this.card_type = parms.card_type;
			this.source = parms.source;
			
			if (this.card_type == "CC") {
				uni.setNavigationBarTitle({
					title: '选择信用卡'
				})
			} else if (this.card_type == "DC") {
				if(this.source == 'withdraw'){
					this.selectIndex = parms.dcindex
				}
				uni.setNavigationBarTitle({
					title: '选择储蓄卡'
				})
			}
			this.initData()
		},
		onNavigationBarButtonTap(e) {
			this.addCard();
		},
		onShow() {
			this.initData()
		},
		onReady() {
			let pages = getCurrentPages();
			let page = pages[pages.length - 1];
			let currentWebview = page.$getAppWebview();
			let titleObj = currentWebview.getStyle().titleNView;
			if (this.card_type == "CC") {
				titleObj.buttons[0].text = "添加信用卡";
			} else if (this.card_type == "DC") {
				titleObj.buttons[0].text = "添加储蓄卡";
			}
			currentWebview.setStyle({
				titleNView: titleObj
			});
		},
		methods: {
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
					this.selectData = this.card[0]
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
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
			selectCard(item, index) {
				this.selectIndex = index;
				this.selectData = item
			},
			details() {
				let pages = getCurrentPages(); //获取所有页面栈实例列表
				let prevPage = pages[pages.length - 2]; //上一页页面实例
				let item = this.selectData;
				if (this.card_type == 'DC' && this.source == 'withdraw') {
					prevPage.$vm.card_info = item; //修改上一页面的 card_info 参数值为 value
					prevPage.$vm.title = item.bank_name + '     尾号' + item.card_no.substr(item.card_no.length - 4, item.card_no.length)
					prevPage.$vm.type = 2
					uni.navigateBack()
				} else if (this.card_type == 'DC' && this.source == 'gathering') {
					prevPage.$vm.formData.cashCard = item;
					prevPage.$vm.title = item.bank_name + '     尾号' + item.card_no.substr(item.card_no.length - 4, item.card_no.length)
					uni.navigateBack()
				}  else if (this.card_type == 'DC' && this.source == 'nfc') {
					uni.navigateTo({
						url: '../gathering/gathering?source='+this.source
					})
				} else if (this.card_type == 'CC' && this.source == 'channel') {
					uni.navigateTo({
						url: '../gathering/channel?card_id=' + item.card_id
					})
				} else if (this.card_type == 'CC' && this.source == 'gathering' || this.card_type == 'CC' && this.source == 'pos' || this.card_type == 'CC' && this.source == 'huabei') {
					uni.navigateTo({
						url: '../gathering/gathering?card_id=' + item.card_id+'&source='+this.source
					})
				}


			}
		}
	}
</script>

<style lang="scss">
	.hascard {
		padding: 0 30rpx 50rpx 30rpx;
		background: #FFF;

		.card {
			position: relative;
			margin: 30rpx 0;
			padding: 40rpx 50rpx;
			box-shadow: 8px 2px 12px 0px rgba(189, 189, 189, 0.35), -8px 2px 12px 0px rgba(189, 189, 189, 0.35);
			border-radius: 20rpx;

			.select-icon {
				position: absolute;
				right: 30rpx;
				top: 30rpx;
			}
		}
	}

	.botttom-addbtn {
		position: fixed;
		bottom: 30rpx;
		height: 90rpx;
		left: 75rpx;
		right: 75rpx;
		line-height: 90rpx;
		text-align: center;
		border-radius: 50rpx;
		background: linear-gradient(270deg, rgba(255, 186, 0, 1), rgba(255, 207, 0, 1));
		color: #FFF;
	}

	.cash-card {
		margin: 30rpx 0;
		padding: 30rpx 40rpx;
		border-radius: 20rpx;
		color: #FFF;
		position: relative;

		.select-icon {
			position: absolute;
			right: 30rpx;
			top: 30rpx;
		}

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

			.u-image {
				background: transparent;
			}
		}
	}

	.sure-btn {
		width: 500rpx;
		height: 75rpx;
		line-height: 75rpx;
		border-radius: 50rpx;
		background: linear-gradient(270deg, rgba(255, 186, 0, 1), rgba(255, 207, 0, 1));
		color: #FFF;
		font-size: 32rpx;
		text-align: center;
		margin: 30rpx auto;

	}
</style>
