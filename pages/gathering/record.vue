<template>
	<view class="main">
		<view class="tabs">
			<u-tabs :is-scroll="false" ref="uTabs" bar-width="80" inactive-color="#030400" bar-height="6" height="90" name="name"
			 duration="0.3" active-color="#FFBA37" :list="tablist" :current="tabsIndex" @change="changeNavbar"></u-tabs>
			<u-gap height="20" bg-color="#F2F2F2"></u-gap>
		</view>
		<mescroll-body :height="scrollerHeight" ref="mescrollRef" @init="mescrollInit" :up="upOption" @down="downCallback"
		 :down="downOption" @up="upCallback">
			<view class="u-border-bottom white-bg u-padding-30 u-flex u-row-between u-col-center" v-for="(item,index) in data" :key="index">
				<u-image width="70rpx" height="70rpx" shape="circle" v-if="type==2" :src="item.reach_card_info.bank_icon"></u-image>
				<u-image width="70rpx" height="70rpx" shape="circle" v-else :src="item.pay_card_info.bank_icon"></u-image>
				<view class="u-flex-1 u-margin-left-30">
					<view class="u-flex u-row-between">
						<text class="u-main-color u-font-28" v-if="type==2">{{item.reach_card_info.bank_name}}  尾号{{item.reach_card_info.card_no_foot}}</text>
						<text class="u-main-color u-font-28" v-else>{{item.pay_card_info.bank_name}}  尾号{{item.pay_card_info.card_no_foot}}</text>
						<text class="main-color u-font-36" :style="{color:type==3?'#FF0000':'#FFBA37'}">+{{item.amount}}</text>
					</view>
					<view><text v-if="type!=2">原因:{{item.pay_result}}</text> </view>
					<view class="u-flex u-row-between u-margin-top-10 u-font-24 u-type-info">
						<text>{{$u.timeFormat(item.order_time, 'yyyy年mm月dd日 hh:MM') }}</text>
						<text v-if="type==1">处理中</text>
						<text v-if="type==2">提现成功</text>
						<text v-if="type==3">提现失败</text>
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
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		data() {
			return {
				tabsIndex: 0,
				data: [],
				serviceData:{},
				scrollerHeight:'',
				tablist: [{
						name: '处理中'
					},
					{
						name: '提现成功'
					},
					{
						name: '提现失败'
					}
				],
				upOption: {
					page: {
						size: 10 // 每页数据的数量,默认10
					},
					noMoreSize: 5, // 配置列表的总数量要大于等于5条才显示'-- END --'的提示
					empty: {
						tip: '~ 搜索无数据 ~'
					},
					textNoMore: '已经到底了',
					auto: false,
				},
				downOption: {
					auto: false
				},
				page:1,
				isTop: true,
				type:1
			};
		},
		onReady() {
			let that = this;
			uni.getSystemInfo({ //调用uni-app接口获取屏幕高度
				success(res) { //成功回调函数
					let height = res.windowHeight //windoHeight为窗口高度，主要使用的是这个
					let titleH = uni.createSelectorQuery().select(".tabs"); //想要获取高度的元素名（class/id）
					titleH.boundingClientRect(data => {
						that.scrollerHeight = height - data.height + 'px' //计算高度：元素高度=窗口高度-元素距离顶部的距离（data.top）
					}).exec()
				}
			})
		},
		onNavigationBarButtonTap(e) {
			if (e.index == 0) {
				uni.navigateTo({
					url: '../mine/service'
				})
			}
		},
		onLoad() {
			this.initData();
		},
		methods: {
			async initData(){
				let res = await this.http.request({
					api_source: 'app',
					uri: '/Trade/trade_records',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
						page: this.page,
						type:this.type
					}
				})
				if (res.data.status == 1) {
					if (this.page == 1) this.data = [];
					
					this.serviceData = res.data.body.service;
					this.data = this.data.concat(res.data.body.forword_list)
					let currlen = 0;
					for (var i in this.data) {
						currlen++
					}
					this.mescroll.endSuccess(currlen);
				}else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
			},
			changeNavbar(index) {
				this.data = [];
				this.type = index+1;
				this.tabsIndex = index;
				this.initData()
			},
			//下拉刷新
			downCallback() {
				this.isTop = true;
				this.data = []
				this.page = 1;
				this.initData();
			},
			//上拉加载
			upCallback(page) {
				this.isTop = false;
				this.page = page.num;
				this.initData()
			},
		}
	}
</script>

<style lang="scss">
	page{
		background: #F2F2F2;
	}
	.list{
		padding: 30rpx;
		background: #FFF;
		
	}
</style>
