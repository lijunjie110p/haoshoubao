<template>
	<view class="main">
		<view class="head">
			<view class="grid u-flex u-row-between u-col-center">
				<view class="u-text-center u-flex-1">
					<view><text class="font-blod num">{{data.direct||0}}</text></view>
					<view><text class="u-type-info u-font-28">直接邀请</text></view>
				</view>
				<view class="line"></view>
				<view class="u-text-center u-flex-1">
					<view><text class="font-blod num">{{data.indirect||0}}</text></view>
					<view><text class="u-type-info u-font-28">间接邀请</text></view>
				</view>
			</view>
		</view>
		<view class="tabs">
			<u-tabs :is-scroll="false"  ref="uTabs"  bar-width="80" inactive-color="#999" bar-height="6" bg-color="#FFF" height="80" name="group_name"
			 duration="0.3" active-color="#FFBA37" :list="tablist" :current="tabsIndex" @change="changeNavbar"></u-tabs>
		</view>
		<u-gap height="20" bg-color="#F2F2F2"></u-gap>
		<view class="list">
			<u-cell-group :border="false">
				<u-cell-item @click="details(item.uid)" :center="true" :key="index" :arrow="false" :title-style="{marginLeft:'20rpx',fontSize:'32rpx'}" :title="item.nickname"
				 :label="item.group_name" v-for="(item,index) in list">
					<u-avatar :src="item.avatar" size="120" slot="icon"></u-avatar>
					<view slot="right-icon"><text class="u-font-32">已邀请{{item.sort_count||0}}人</text></view>
				</u-cell-item>
			</u-cell-group>
			<u-loadmore font-size="30" margin-top="20" :load-text="{loadmore:'点击或上拉加载更多',loading: '努力加载中',nomore:'没有更多了'}"
			 :status="status" @loadmore="onreachBottom" />
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
				status: 'loadmore',
				page: 1,
				tabsIndex: 0,
				tablist: [{
					group_id:0
				}],
				list: [],
				data:''
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
		methods: {
			changeNavbar(index) {
				this.tabsIndex = index;
				this.page = 1;
				this.list = [];
				this.initData();
			},
			onreachBottom() {
				this.page++
				this.initData();
			},
			onreachBottom() {
				this.page++
				this.initData();
			},
			async initData() {
				this.status = 'loading'
				let res = await this.http.request({
					api_source: 'app',
					uri: '/Activity/partner_invite',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
						page: this.page,
						group_id:this.tablist[this.tabsIndex].group_id
					}
				})
				if (res.data.status == 1) {
					this.data = res.data.body;
					this.list = this.list.concat(res.data.body.list)||[];
					this.tablist = res.data.body.group_list;
					if ( res.data.body.list.length == 0) {
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
			details(sid){
				uni.navigateTo({
					url: 'details?sonid='+sid
				})
			}
		}
	}
</script>

<style lang="scss">
	.head {
		background: $ez-theme-bg;
		height: 200rpx;
		position: relative;

		.grid {
			position: absolute;
			bottom: -60rpx;
			left: 30rpx;
			right: 30rpx;
			background: #FFFFFF;
			border-radius: 20rpx;
			overflow: hidden;
			box-shadow:0px 4px 14px 0px rgba(151,119,56,0.12);
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
	.tabs{
		margin-top: 80rpx;
		padding: 0 30rpx;
	}
	.list{
		padding: 0 30rpx;
	}
</style>
