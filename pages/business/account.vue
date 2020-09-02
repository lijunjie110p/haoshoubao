<template>
	<view class="main">
		<view class="head">
			<view class="banner">
				<view class="u-flex u-row-center u-col-center">
					<u-image width="30rpx" height="30rpx" shape="circle" src="https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-08-06/5f2bfc91b3f40.png"></u-image>
					<view><text class="u-font-28 u-margin-left-10">本月收入（元）</text></view>
				</view>
				<view class="u-margin-top-40">
					<text class="price">{{profit_sum||0}}</text>
				</view>
			</view>
			<view class="content">
				<view class="u-padding-30 u-flex u-row-between">
					<text>日期</text>
					<view class="date" @click="showDate=true">
						<text class="u-type-info u-font-24">{{startTime}}</text>
						<u-icon name="calendar" size="35"></u-icon>
					</view>
					<text>-</text>
					<view class="date" @click="showDate=true">
						<text class="u-type-info u-font-24">{{endTime}}</text>
						<u-icon name="calendar" size="35"></u-icon>
					</view>
					<u-icon @click="initData" name="search" color="#FFC800" size="40"></u-icon>
				</view>
				<u-calendar toolTip="请选择开始日期和结束日期" btn-type="warning" range-bg-color="rgba(255,200,0,0.13)" range-color="#ff9113"
				 active-bg-color="#ff9900" :safe-area-inset-bottom="true" v-model="showDate" max-date="2050-01-01" mode="range"
				 @change="dateChange"></u-calendar>
			</view>
			<view class="u-flex u-row-between u-text-center u-col-center title">
				<view class="u-flex-1"><text class="u-font-28 u-main-color">银行</text></view>
				<view class="u-flex-1"><text class="u-font-28 u-main-color">核卡数</text></view>
				<view class="u-flex-1"><text class="u-font-28 u-main-color">明细</text></view>
			</view>
		</view>
		<mescroll-body :height="scrollerHeight" ref="mescrollRef" @init="mescrollInit" :up="upOption" @down="downCallback"
		 :down="downOption" @up="upCallback">
			<view class="list u-text-center" v-for="(data,index) in dataList" :key="index">
				<view class="u-flex u-row-between u-text-center u-col-center">
					<view class="u-flex-1">
						<view class="u-flex u-col-center u-row-center">
							<u-image width="55rpx" height="55rpx" shape="circle" :src="data.logourl"></u-image>
							<text class="u-margin-left-20 u-font-28 u-main-color">{{data.name}}</text>
						</view>
					</view>
					<view class="u-flex-1">
						<view class="u-font-28 u-main-color"><text>{{data.sum}}</text></view>
					</view>
					<view class="u-flex-1">
						<view class="u-font-28 u-main-color"><text>+{{data.userprice||0}}</text></view>
					</view>
				</view>
				<view class="u-flex u-row-between u-text-center u-col-center">
					<view class="u-flex-1">
						<view class="u-font-24 u-tips-color u-margin-top-30">
							<text class="u-margin-left-20 u-font-24 u-line-1 ">{{data.cftime||'1970-01-01'}}</text>
						</view>
					</view>
					<view class="u-flex-1">
						<view class="u-margin-top-30"> </view>
					</view>
					<view class="u-flex-1">
						<view class="u-font-24 u-tips-color u-margin-top-30">
							<text>已完成</text>
						</view>
					</view>
				</view>
			</view>
		</mescroll-body>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	import MescrollMixin from "@/components/mescroll-uni/mescroll-mixins.js";
	export default {
		mixins: [MescrollMixin], // 使用mixin
		data() {
			return {
				dataList: [],
				profit_sum: '',
				scrollerHeight: '', //滚动高度
				startTime: '',
				showDate: false,
				endTime: '',
				page: 1,
				upOption: {
					page: {
						size: 10 // 每页数据的数量,默认10
					},
					noMoreSize: 3, // 配置列表的总数量要大于等于5条才显示'-- END --'的提示
					empty: {
						tip: '已经没有了'
					},
					textNoMore: '已经没有了',
					auto: false,
				},
				downOption: {
					auto: false
				},
				isTop: true,
			};
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		onLoad() {
			let date = new Date(),
				year = date.getFullYear(),
				month = date.getMonth() + 1,
				day = date.getDate();
			this.startTime = `${year}-${month}-${day}`
			this.endTime = `${year}-${month}-${day}`
			this.initData()
		},
		onReady() {
			let that = this;

			uni.getSystemInfo({ //调用uni-app接口获取屏幕高度
				success(res) { //成功回调函数
					let height = res.windowHeight //windoHeight为窗口高度，主要使用的是这个
					let titleH = uni.createSelectorQuery().select(".head"); //想要获取高度的元素名（class/id）
					titleH.boundingClientRect(data => {
						that.scrollerHeight = height - data.height - 15 + 'px' //计算高度：元素高度=窗口高度-元素距离顶部的距离（data.top）
					}).exec()
				}
			})
		},
		methods: {
			async initData() {
				uni.showLoading({
					mask: true,
					title: ''
				})
				let res = await this.http.request({
					api_source: 'app',
					uri: '/CreditList/credit_info',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
						create_time_begin: this.startTime,
						create_time_end: this.endTime
					}
				})

				if (res.data.status == 1) {
					if (this.page == 1) this.dataList = [];
					this.profit_sum = res.data.body.profit_sum;
					this.dataList = this.dataList.concat(res.data.body.bank_list)
					if (this.isTop) {
						this.mescroll.resetUpScroll();
					} else {
						this.mescroll.endSuccess(this.dataList.length, true);
					}
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
				uni.hideLoading()
			},
			//下拉刷新
			downCallback() {
				this.isTop = true;
				this.dataList = []
				this.initData();

			},
			//上拉加载
			upCallback(page) {
				this.isTop = false;
				this.page = page.num;
				this.initData();
			},
			dateChange(e) {
				this.dataList = []
				this.startTime = e.startDate
				this.endTime = e.endDate
				this.initData();
			}
		}
	}
</script>

<style lang="scss">
	.main {
		padding-top: 30rpx;
	}

	.head {
		z-index: 990;
		position: sticky;
		top: 0;
		background-color: #fff;
	}

	.banner {
		display: flex;
		flex-direction: column;
		margin: 0 30rpx;
		background: linear-gradient(270deg, rgba(254, 143, 0, 1) 0%, rgba(253, 169, 38, 1) 100%);
		box-shadow: 0px 5px 14px 0px rgba(151, 119, 56, 0.3);
		border-radius: 20rpx;
		color: #FFF;
		justify-content: center;
		align-items: center;
		padding: 60rpx 0;

		.price {
			font-size: 70rpx;
			font-weight: bold;
		}

		.price:before {
			content: "￥";
			font-size: 22rpx;
			margin-right: 5rpx;
		}
	}

	.content {
		.date {
			border-radius: 10rpx;
			border: 1px solid #CCCCCC;
			display: flex;
			padding: 0 20rpx;
			height: 55rpx;
			justify-content: space-between;
			align-items: center;
			width: 200rpx;
		}

	}

	.title {
		height: 90rpx;
		background: #F6F6F6;
	}

	.list {
		padding: 20rpx 0;
		border-bottom: 1px solid #E6E6E6;
	}
</style>
