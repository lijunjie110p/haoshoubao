<template>
	<view class="main">
		<view class="tabs">
			<u-tabs :is-scroll="false" ref="uTabs" bar-width="80" inactive-color="#999" bar-height="6" bg-color="#F6F6F6" height="90"
			 name="name" duration="0.3" active-color="#FFBA37" :list="tablist" :current="tabsIndex" @change="changeNavbar"></u-tabs>
		</view>
		<view class="white-bg" v-for="(item,index) in data" @click="jump(item)" :key="index">
			<view class="u-padding-30 u-flex u-row-between u-col-center">
				<view class="u-flex-1">
					<view class="u-font-30 u-main-color"><text>{{item.count}}</text></view>
					<view class="u-type-info u-font-28"><text>{{item.send_date}}</text></view>
				</view>
				<view class="u-flex-1 u-text-right ">
					<text class="u-font-30 font-blod u-main-color">￥{{item.total_amount}}</text>
				</view>
			</view>
			<u-gap height="20" bg-color="#F2F2F2"></u-gap>
		</view>
		<u-loadmore bg-color="#F2F2F2" font-size="30" margin-top="20" :load-text="{loadmore:'点击或上拉加载更多',loading: '努力加载中',nomore:'没有更多了'}"
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
				tabsIndex: 0,
				tablist: [{
						name: '日'
					},
					{
						name: '月'
					}
				],
				data: [],
				page: 1,
				type: 1,
				status: 'loadmore',
				parms_id: ''
			};
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		onPullDownRefresh() {
			this.page = 1;
			this.data = [];
			this.initData();
		},
		onReachBottom() {
			if (this.status == 'loadmore') {
				this.onreachBottom()
			}
		},
		onLoad(parms) {
			this.parms_id = parms.source
			switch (parms.source) {
				case '34':
					uni.setNavigationBarTitle({
						title: '收款业绩'
					});
					break;
				case 'profit':
					uni.setNavigationBarTitle({
						title: '团队业绩'
					});
					break;
				default:
					break;
			}
			this.initData()
		},
		methods: {
			onreachBottom() {
				this.page++
				this.initData();
			},
			jump(item){
				uni.navigateTo({
					url:'performanceDetails?parms_id='+this.parms_id+'&send_date='+item.send_date+'&type='+this.tabsIndex
				})
			},
			changeNavbar(index) {
				this.data = [];
				this.page = 1;
				this.tabsIndex = index;
				this.type = index + 1
				this.initData()
			},
			async initData() {
				this.status = 'loading'
				let res = await this.http.request({
					api_source: 'app',
					uri: '/Benefit/trade_achievement',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
						page: this.page,
						appid: this.parms_id,
						type: this.type
					}
				})
				if (res.data.status == 1) {
					this.data = this.data.concat(res.data.body)
					
					if (res.data.body.length == 0) {
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
		}
	}
</script>

<style lang="scss">
	page{
		background: #F2F2F2;
	}
	.tabs {
		z-index: 990;
		position: sticky;
		top: 0;
		background: #F6F6F6;
		padding: 0 30rpx;
	}

	.item {
		width: 100%;
		background: #FFF;
	}
</style>
