<template>
	<view class="main">
		<view class="head u-flex u-col-center u-flex-col u-row-center">
			<view class="u-flex u-row-center u-col-center">
				<u-image :src="data.parent_info.avatar" shape="circle" width="90rpx" height="90rpx"></u-image>
				<view class="u-margin-left-30 u-margin-right-30">
					<u-icon name="arrow-right" color="#333" size="50"></u-icon>
				</view>
				<u-image :src="data.son_info.avatar" shape="circle" width="60rpx" height="60rpx"></u-image>
			</view>
			<view class="u-margin-top-30 u-margin-bottom-30 u-font-32"><text>{{$u.timeFormat(data.create_time, 'yyyy.mm.dd') }}
					我们建立关系</text></view>
			<view class="u-font-32">距今已<text class="bigfont">{{data.days}}</text>天</view>
		</view>
		<view v-for="(item,index) in data.list" :key="index">
			<view class="title"><text>{{item.title}}</text></view>
			<view class="list u-flex u-row-between u-col-center">
				<view class="u-text-center">
					<view class="u-font-28">{{item.yesterday_show}}</view>
					<view class="u-font-32 font-blod">{{item.yesterday}}</view>
				</view>
				<view class="u-text-center">
					<view class="u-font-28">{{item.seven_days_show}}</view>
					<view class="u-font-32 font-blod">{{item.seven_days}}</view>
				</view>
				<view class="u-text-center">
					<view class="u-font-28">{{item.thirty_days_show}}</view>
					<view class="u-font-32 font-blod">{{item.thirty_days}}</view>
				</view>
			</view>
		</view>
		<view class="foot u-flex u-col-center u-text-center u-row-between">
			<view @click="transfer " class="u-flex-1 u-font-30 font-blod white-color main-bg">
				<text>转账给TA</text>
			</view>
			<view @click="telphone" class="u-flex-1 u-font-30 font-blod main-color white-bg">
				<text>给TA打电话</text>
			</view>
			<view @click="sendMsg" class="u-flex-1 u-font-30 font-blod main-color white-bg">
				<text>给TA发消息</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	export default {

		data() {
			return {
				sonid: '',
				data: {
					parent_info: {
						avatar: ''
					},
					son_info: {
						avatar: ''
					}
				}
			};
		},
		onLoad(parms) {
			this.sonid = parms.sonid
			this.initData();
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		methods: {
			...mapMutations(['saveSonInfo']),
			async initData() {
				let res = await this.http.request({
					api_source: 'app',
					uri: '/User/user_firend_info',
					method: 'POST',
					device: 'web',
					data: {
						parent_uid: this.userInfo.uid,
						son_uid: this.sonid
					}
				})
				if (res.data.status == 1) {
					this.data = res.data.body
				}else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
			},
			transfer(){
				this.saveSonInfo(this.data.son_info)
				uni.navigateTo({
					url:'transfer?ruid='+this.sonid
				})
			},
			telphone() {
				uni.makePhoneCall({
					phoneNumber: this.data.son_info.mobile
				})
			},
			sendMsg() {
				let msg = plus.messaging.createMessage(plus.messaging.TYPE_SMS);
				msg.to = [this.data.son_info.mobile];
				plus.messaging.sendMessage(msg, function() {
					alert("Send success!");
				}, function() {
					alert("Send failed!");
				});

			}
		}
	}
</script>

<style lang="scss">
	page {
		background: #F2F2F2;
	}

	.head {
		padding: 50rpx;

		.bigfont {
			color: $ez-theme-bg;
			margin: 0 10rpx;
			font-weight: bold;
			font-size: 46rpx;
		}
	}

	.title {
		padding: 20rpx 30rpx;
		background: #F2F2F2;
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}

	.list {
		background: #FFF;
		padding: 30rpx;

	}

	.foot {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 90rpx;
		line-height: 90rpx;

		view {
			height: 100%;
		}
	}
</style>
