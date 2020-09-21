<template>
	<view class="main">
		<view class="info u-flex u-flex-col u-row-center u-col-center">
			<u-icon color="#FFCB00" size="100" name="rmb-circle-fill"></u-icon>
			<view class="u-margin-30 u-font-32"><text>{{data.count}}</text></view>
			<view class="price">
				<text>￥</text>
				<text>{{data.total_amount}}</text></view>
		</view>
		<view>
			<u-line length="100%" color="#E6E6E6"></u-line>
			<view class="white-bg" v-for="(item,index) in list" @click="jump(item)" :key="index">
				<view class="list u-flex u-row-between u-col-center">
					<view>
						<u-avatar size="70" :src="item.avatar"></u-avatar>
					</view>
					<view class="u-flex-1 u-margin-left-30">
						<view class="u-font-30 u-main-color"><text>{{item.realname}}</text></view>
						<view class="u-type-info u-line-1 u-font-24"><text>{{$u.timeFormat(item.create_time, 'yyyy-mm-dd hh:MM:ss')}}</text></view>
					</view>
					<view class="u-flex-1 u-text-right ">
						<text class="u-font-30 font-blod u-main-color">￥{{item.com_amount}}</text>
					</view>
				</view>
				<u-line length="100%" color="#E6E6E6"></u-line>
			</view>
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
				data: {},
				send_time: '',
				parms_id: '',
				page: 1,
				list: [],
				status: 'loadmore'
			};
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		onLoad(parms) {
			this.parms_id = parms.parms_id
			if (parms.type == 1) {
				this.send_time = parms.send_date.substr(0, 7)
			} else {
				this.send_time = parms.send_date
			}
			this.initData();
		},
		onPullDownRefresh() {
			this.page = 1;
			this.list = [];
			this.initData();
		},
		onReachBottom() {
			if (this.status == 'loadmore') {
				this.onreachBottom()
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
					uri: '/Benefit/trade_list',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
						page: this.page,
						appid: this.parms_id,
						date: this.send_time
					}
				})
				if (res.data.status == 1) {
					if (res.data.body.length == 0) {
						this.status = 'nomore'
					} else {
						this.status = 'loadmore'
					}
					this.data = res.data.body
					this.list = this.list.concat(res.data.body.list)

				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
				uni.stopPullDownRefresh()
			},
			jump(item) {
				uni.navigateTo({
					url: '../wallet/billDetails?source=performance&id=' + item.id
				})
			}
		}
	}
</script>

<style lang="scss">
	.info {
		height: 400rpx;
		background: #FFF;
		position: sticky;
		top: 0;
		z-index: 999;
		background: #FFF;

		.price {
			font-size: 55rpx;
			font-weight: bold;
			color: #030400;
		}
	}

	.list {
		padding: 20rpx 30rpx;
	}
</style>
