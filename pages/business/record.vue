<template>
	<view class="main">
		<view>
			<view class="item" v-for="(item,index) in dataList" :key="index">
				<u-gap bg-color="#F2F2F2" height="20"></u-gap>
				<view class="info u-flex u-row-between u-col-center">
					<view>
						<u-image :src="item.logourl" shape="circle" width="90rpx" height="90rpx"></u-image>
					</view>
					<view>
						<view><text class="u-font-28">{{item.name}}</text></view>
						<view><text class="u-font-24">姓名：{{item.cname}}</text><text class="u-font-24 u-margin-left-10">电话{{item.cmobile}}</text></view>
					</view>
					<view>
						<view>
							<u-button @click="jump(item.searchurl)" :custom-style="{color:'#FDA520'}" :plain="true" size="mini">查询进度</u-button>
						</view>
						<view class="u-margin-top-20">
							<u-button @click="jump(item.curl)" :plain="true" size="mini">完善资料</u-button>
						</view>
					</view>
				</view>
				<view class="u-flex u-flex-col u-col-bottom u-row-right">
					<u-line length="80%" class="#F2F2F2"></u-line>
					<view class="u-padding-20 u-text-right u-font-24 u-type-info">
						<text>申请时间：{{$u.timeFormat(item.caddtime, 'yyyy年mm月dd日 hh时MM分ss秒')}}</text>
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
				dataList: [],
				page: 1,
			};
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		onLoad() {
			this.initData()
		},
		onPullDownRefresh() {
			this.dataList = [];
			this.page = 1;
			this.initData()
		},
		methods: {
			async initData() {
				let res = await this.http.request({
					api_source: 'app',
					uri: '/CreditList/creditbank_list',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid
					}
				})
				if (res.data.status == 1) {
					if (res.data.body.length == 0) {
						this.status = 'nomore'
					} else {
						this.status = 'loadmore'
					}
					this.dataList = this.dataList.concat(res.data.body)
				}else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
				uni.stopPullDownRefresh();
			},
			jump(url){
				uni.navigateTo({
					url:'../public/webView?url='+encodeURIComponent(url)
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		background: #F2F2F2;
	}
	.item{
		background: #FFF;
		.info {
			padding:30rpx;
		}
	}
	
</style>
