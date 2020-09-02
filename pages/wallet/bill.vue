<!-- 分润 账单 -->
<template>
	<view class="main">
		<view class="head">
			<view class="u-text-center u-font-30 type-select" @click="showPopup = true">
				<text class="u-margin-right-10">{{type.name}}</text>
				<u-icon name="arrow-down-fill" color="#999" size="20"></u-icon>
			</view>
			<u-popup length="70%" v-model="showPopup" mode="bottom" :safe-area-inset-bottom="true" :closeable="true">
				<view class="popup-title u-text-center u-padding-20"><text class="font-blod u-font-32">选择类型</text></view>
				<u-line length="100%" color="#E6E6E6"></u-line>
				<u-cell-group :border="false">
					<u-cell-item @click="selectType(item)" :center="true" :arrow="false" :title="item.vtitle" v-for="(item,index) in typeData"
					 :key="index"></u-cell-item>
				</u-cell-group>
			</u-popup>
			<view class="datefomart">
				<view class="u-padding-30 u-flex u-row-between">
					<text class="u-font-30">日期</text>
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
		</view>
		<mescroll-body :height="scrollerHeight" ref="mescrollRef" @init="mescrollInit" :up="upOption" @down="downCallback"
		 :down="downOption" @up="upCallback">
			<view class="list" v-for="(item,index) in dataList" :key="index">
				<view class="group-title">
					<view class="u-main-color u-font-36"><text>{{item.date}}</text></view>
					<view class="u-type-info u-font-28 u-margin-top-10"><text>收入￥{{item.add_all}}</text><text v-if="source=='bill'"
						 class="u-margin-left-20">支出￥{{item.dec_all}}</text></view>
				</view>
				<u-cell-group :border="false">
					<u-cell-item @click="jump(list)" v-for="(list,i) in item.list" :center="true" :arrow="false" :title-style="{marginLeft:'20rpx',fontSize:'32rpx'}">
						<u-image slot="icon" width="90rpx" height="90rpx" shape="circle" :src="list.icon"></u-image>
						<view slot="title" class="u-margin-left-20">
							<view class="u-line-1 u-main-color">
								<text class="u-font-28" v-if="source=='bill'">{{list.info.info}}</text>
								<text class="u-font-28" v-if="source=='profit'">{{list.name}}</text></view>
							<view class="u-font-24 u-type-info">
								<text>{{list.create_time_date}}</text>
								<text class="u-margin-left-10" v-if="source=='bill'">{{list.info.state}}</text>
								<text class="u-margin-left-10" v-if="source=='profit'">{{list.benfit_info}}</text>
							</view>
						</view>
						<view slot="right-icon" class="u-text-right">
							<view class="main-color u-font-36 font-blod"><text v-if="list.act_type=='out'">-</text><text v-else>+</text>{{list.amount}}</view>
							<view class="u-main-color u-font-24" v-if="source=='bill'">余额:{{list.balance}}</view>
							<view class="u-main-color u-font-24 u-line-1" v-if="source=='profit'">{{list.order_amount}}</view>
						</view>
					</u-cell-item>
				</u-cell-group>
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
				type: {
					id: '',
					name: '所有类型'
				},
				source: '', //来源页面
				typeData: '',
				scrollerHeight: '',
				startTime: '',
				showDate: false,
				endTime: '',
				page: 1,
				upOption: {
					page: {
						size: 10 // 每页数据的数量,默认10
					},
					noMoreSize: 5, // 配置列表的总数量要大于等于5条才显示'-- END --'的提示
					empty: {
						tip: '~ 搜索无数据 ~'
					},
					textNoMore: '没有更多了',
					auto: false,
				},
				downOption: {
					auto: false
				},
				dataList: [],
				isTop: true,
				showPopup: false,
			};
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		onReady() {
			let that = this;
			uni.getSystemInfo({ //调用uni-app接口获取屏幕高度
				success(res) { //成功回调函数
					let height = res.windowHeight //windoHeight为窗口高度，主要使用的是这个

					let titleH = uni.createSelectorQuery().select(".head"); //想要获取高度的元素名（class/id）
					titleH.boundingClientRect(data => {
						that.scrollerHeight = height - data.height + 'px' //计算高度：元素高度=窗口高度-元素距离顶部的距离（data.top）
					}).exec()
				}
			})
		},
		onLoad(parms) {
			this.source = parms.source
			switch (parms.source) {
				case 'bill':
					uni.setNavigationBarTitle({
						title: '账单记录'
					});
					break;
				case 'profit':
					uni.setNavigationBarTitle({
						title: '分润记录'
					});
					break;
				default:
					break;
			}

			let date = new Date(),
				year = date.getFullYear(),
				month = date.getMonth() + 1,
				day = date.getDate(),
				hour = date.getHours(),
				mint = date.getMinutes(),
				secounds = date.getSeconds();
			this.startTime = `${year}-${month}-1`;
			this.endTime = `${year}-${month}-${day}`;
			this.getType();
			this.initData();
		},
		methods: {
			async getType() {
				let url = ''
				switch (this.source) {
					case 'bill':
						url = '/Member/bill_type'
						break;
					case 'profit':
						url = '/Benefit/benfit_type'
						break;
					default:
						break;
				}
				let res = await this.http.request({
					api_source: 'app',
					uri: url,
					method: 'POST',
					device: 'web',
					data: {}
				})
				if (res.data.status == 1) {
					this.typeData = res.data.body;
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
			},
			async initData() {
				let url = ''
				if (this.source == 'bill') {
					url = '/Member/bill'
				} else if (this.source == 'profit') {
					url = '/Benefit/benfit_records'
				}
				uni.showLoading({
					title: ''
				})
				let res = await this.http.request({
					api_source: 'app',
					uri: url,
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
						page: this.page,
						app_id: this.type.id,
						create_time_begin: this.startTime,
						create_time_end: this.endTime
					}
				})
				uni.hideLoading()
				if (res.data.status == 1) {
					let currlen = 0;
					for (var i in res.data.body) {
						for (var j in res.data.body[i].list) {
							currlen++
						}
					}
					this.mescroll.endSuccess(currlen);
					if (this.page == 1) this.dataList = [];
					this.dataList = this.dataList.concat(res.data.body)
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
			},
			dateChange(e) {
				this.dataList = []
				this.startTime = e.startDate
				this.endTime = e.endDate
				this.initData();
			},
			//下拉刷新
			downCallback() {
				this.getType();
				this.mescroll.resetUpScroll();
			},
			//上拉加载
			upCallback(page) {
				this.page = page.num;
				this.initData()
			},
			selectType(item) {
				this.type.id = item.vid;
				this.type.name = item.vtitle;
				this.showPopup = false
				this.initData();
			},
			jump(item) {
				if (this.source == 'bill') {
					uni.navigateTo({
						url: 'billDetails?source=bill&record_id=' + item.record_id
					})
				}
			}
		}
	}
</script>

<style lang="scss">
	.head {
		z-index: 990;
		position: sticky;
		top: 0;
		background-color: #fff;
	}

	.type-select {
		height: 90rpx;
		line-height: 90rpx;
		border-bottom: 1px solid #F2F2F2;
	}

	.datefomart {
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

	.list {
		.group-title {
			background: #F6F6F6;
			padding: 20rpx 30rpx;
		}
	}

	.popup-title {
		position: sticky;
		top: 0;
		z-index: 999;
		background: #FFF;
	}
</style>
