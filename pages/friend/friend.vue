<template>
	<view class="main">
		<view class="u-text-center userinfo">
			<view class="text"><text>{{user.realname}}</text><text class="u-margin-left-20">{{user.mobile}}</text></view>
			<view class="headpic">
				<image class="diadema" width="45rpx" src="../../static/image/friend_diadema.png"></image>
				<u-avatar :src="user.avatar" size="155"></u-avatar>
			</view>
			<view class="person u-flex u-row-between u-col-center">
				<view class="u-text-center u-flex-1">
					<view><text class="font-blod num">{{data.all_invite}}</text></view>
					<view><text class="u-type-info u-font-28">已邀请</text></view>
				</view>
				<view class="line"></view>
				<view class="u-text-center u-flex-1">
					<view><text class="font-blod num">{{data.survival_people}}</text></view>
					<view><text class="u-type-info u-font-28">已认证</text></view>
				</view>
			</view>
		</view>
		<view class="group">
			<u-cell-group :border="false">
				<u-cell-item :title-style="{marginLeft:'20rpx',fontSize:'32rpx'}" @click="jump(item.param_id)" v-for="(item,index) in model"
				 :key="index" :title="item.param_name"> 
					<u-image :src="item.param_img" slot="icon" width="45rpx" height="45rpx"></u-image>
				</u-cell-item>
			</u-cell-group>
		</view>
		<u-gap height="20" bg-color="#F2F2F2"></u-gap>
		<view class="list">
			<u-cell-group :border="false">
				<u-cell-item @click="details(item.uid)" :key="index" :arrow="false" :title-style="{marginLeft:'20rpx',fontSize:'32rpx'}" :title="item.realname"
				 :label="item.group_name" v-for="(item,index) in list">
					<u-avatar :src="item.avatar" size="120" slot="icon"></u-avatar>
					<view slot="right-icon"><text class="u-font-32">已邀请{{item.invite_count}}人</text></view>
				</u-cell-item>
			</u-cell-group>
		</view>
		<u-loadmore font-size="30" margin-top="20" :load-text="{loadmore:'点击或上拉加载更多',loading: '努力加载中',nomore:'没有更多了'}"
		 :status="status" @loadmore="onreachBottom" />
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	export default {
		data() {
			return {
				page: 1,
				user: {},
				data: {},
				list: [],
				model: {},
				status: 'loadmore'
			};
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		onLoad() {
			this.initData()
		},
		onPullDownRefresh() {
			this.list = [];
			this.page = 1;
			this.initData()
		},
		onReachBottom() {
			if (this.status == 'loadmore') {
				this.onreachBottom()
			}
		},
		onNavigationBarButtonTap(e){
			if(e.index == 0){
				uni.navigateTo({
					url:'search'
				})
			}
		},
		methods: {
			onreachBottom() {
				this.page++
				this.initData();
			},
			async initData() {
				this.status = 'loading'
				let res = await this.http.request({
					api_source: 'app',
					uri: '/User/user_friend_list',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
						page: this.page
					}
				})
				if (res.data.status == 1) {
					this.data = res.data.body;
					this.user = res.data.body.self_info;
					this.list = this.list.concat(res.data.body.friend_list);
					this.model = res.data.body.model_list
					if (res.data.body.friend_list.length == 0) {
						this.status = 'nomore'
					} else {
						this.status = 'loadmore'
					}
				}else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
				uni.stopPullDownRefresh()
			},
			jump(id) {
				switch (id) {
					case '8':
						uni.navigateTo({
							url: 'top'
						})
						break;
					case '10':
						uni.navigateTo({
							url: 'team'
						})
						break;
					default:
						break;
				}
			},
			details(sid){
				uni.navigateTo({
					url: 'details?sonid='+sid
				})
			}
		}
	}
</script>

<style lang="scss">
	.userinfo {
		background: $ez-theme-bg;
		padding: 30rpx;
		position: relative;
		height: 380rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;

		.text {
			color: #FFF;
			font-size: 30rpx;
		}

		.headpic {
			position: relative;
			margin-top: 50rpx;
			width: 155rpx;

			.u-avatar {
				border: 8rpx solid #FF9E00;
			}

			.diadema {
				width: 45rpx;
				height: 45rpx;
				left: 55rpx;
				position: absolute;
				top: -35rpx;
			}
		}

		.person {
			position: absolute;
			left: 30rpx;
			right: 30rpx;
			bottom: -30rpx;
			background: #FFFFFF;
			border-radius: 20rpx;
			box-shadow: 0px 4px 14px 0px rgba(151, 119, 56, 0.12);
			height: 150rpx;

			.num {
				font-size: 56rpx;
			}

			.line {
				height: 100rpx;
				width: 1px;
				background: #F2F2F2;
			}
		}
	}

	.group {
		padding: 0 30rpx;
		margin-top: 60rpx;

		.u-cell {
			padding: 20rpx 0;
		}
	}

	.list {
		padding: 0 30rpx;

		.u-cell_title {
			display: flex;
			flex-direction: column;
			justify-content: center;
		}
	}
</style>
