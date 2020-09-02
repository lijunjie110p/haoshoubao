<template>
	<view class="main">
		<u-image src="../../static/image/videobanner.png" width="750rpx" mode="widthFix"></u-image>
		<u-gap height="20" bg-color="#F2F2F2"></u-gap>
		<view class="white-bg u-padding-30 u-margin-bottom-20" v-for="(item,index) in list"  :key="index">
			<view><text class="u-font-30">{{item.ptitle}}</text></view>
			<view @click="jump(item.url)" class="video-item u-flex u-row-center u-col-center" :style="{backgroundImage: 'url('+item.pimg+')'}">
				<view class="mask"></view>
				<view ><u-icon name="play-circle" size="100" color="#FFFFFF"></u-icon></view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'
	export default {
		data() {
			return {
				page:1,
				list:[]
			};
		},
		computed: { ...mapState(['userInfo'])
		},
		onLoad(){
			this.initData()
		},
		onPullDownRefresh() {
			this.initData()
		},
		methods:{
			async initData(){
				let res = await this.http.request({
					api_source: 'app',
					uri: '/Message/newhand_show',
					method: 'POST',
					device: 'web',
					data: {}
				})
				
				if(res.data.status == 1){
					this.list = res.data.body.vlist
				}
				uni.stopPullDownRefresh();
			},
			jump(url){
				uni.navigateTo({
					url:'../public/webView?url='+url
				})
			}
		}
	}
</script>

<style lang="scss">
	page{
		background: #F2F2F2;
	}
	.video-item{
		margin-top: 20rpx;
		border-radius: 20rpx;
		background: #CCCCCC;
		overflow: hidden;
		height: 300rpx;
		position: relative;
		background-position: center;
		background-size: 100%;
		background-repeat: no-repeat;
		.mask{
			position: absolute;
			left: 0;
			right: 0;
			bottom: 0;
			top: 0;
			background: rgba(0,0,0,0.2);
		}
	}
</style>
