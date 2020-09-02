<template>
	<view class="main">
		<u-swiper img-mode="widthFix" height="200" name="param_img" border-radius="0" :list="data.banner_list"></u-swiper>
		<view>
			<u-grid :col="3" :border="false" align="center">
				<u-grid-item>
					<u-icon @click="jump(data.service_url)" name="server-man" color="#Fd9F18" size="60"></u-icon>
					<text class="u-font-30 u-margin-top-20">在线客服</text>
				</u-grid-item>
				<u-grid-item>
					<u-icon @click="jump(data.wechat_url)" name="weixin-fill" color="#2AAD67" size="60"></u-icon>
					<text class="u-font-30 u-margin-top-20">微信客服</text>
				</u-grid-item>
				<u-grid-item>
					<u-icon @click="telPhone(data.phone)" name="phone-fill" color="#FD6A06" size="60"></u-icon>
					<text class="u-font-30 u-margin-top-20">客服电话</text>
				</u-grid-item>
			</u-grid>
			<u-gap height="20" bg-color="#F6F6F6"></u-gap>
			<view class="u-padding-30">
				<view class="card white-bg u-flex u-col-top u-row-between">
					<u-avatar :src="data.avatar" size="large"></u-avatar>
					<view class="u-margin-left-10">
						<view><text class="u-font-30 u-main-color">{{data.djname}}</text></view>
						<view class="u-margin-top-10"><text class="u-font-24 u-line-2 u-type-info">我是您的推荐人，可以为您提供推广市场和功能使用等服务</text></view>
					</view>
					<view class="u-margin-left-10">
						<u-button @click="telPhone(data.parent_mobile)" shape="circle" size="mini" :custom-style="btnStyle">联系导师</u-button>
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
				data: {},
				btnStyle: {
					background: 'linear-gradient(270deg,rgba(255,186,0,1),rgba(255,207,0,1))',
					height: '48rpx',
					color: '#FFF',
					border: 'none',
					fontSize: '26rpx'
				},
			};
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		onLoad() {
			this.initData();
		},
		onPullDownRefresh() {
			this.initData();
		},
		methods: {
			async initData() {
				let res = await this.http.request({
					api_source: 'app',
					uri: '/Message/problem_video',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
					}
				})
				if (res.data.status == 1) {
					this.data = res.data.body
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
				uni.stopPullDownRefresh()
			},
			telPhone(mobile) {
				uni.makePhoneCall({
					phoneNumber: mobile
				})
			},
			jump(url) {
				uni.navigateTo({
					url: '../public/webView?url=' + url
				})
			}
		}
	}
</script>

<style lang="scss">
	.card {
		padding: 40rpx 30rpx;
		height: 130rpx;
		box-shadow: 0px 10px 44px 10px rgba(204, 204, 204, 0.3);
		border-radius: 5rpx;

		.headpic {
			border: 1px solid #F2F2F2;
			border-radius: 50%;
			overflow: hidden;
		}
	}
</style>
