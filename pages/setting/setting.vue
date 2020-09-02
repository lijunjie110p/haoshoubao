<template>
	<view class="main">
		<u-gap height="20" bg-color="#F6F6F6"></u-gap>
		<u-cell-group :border="false">
			<u-cell-item :titleStyle="{fontSize:'30rpx'}" title="安全设置" :arrow="false">
				<u-switch slot="right-icon" active-color="#FFBA37" v-model="checkedSec" :loading="checkLoading" @change="changeSecurity"></u-switch>
			</u-cell-item>
			<u-cell-item :border-bottom="false" :titleStyle="{fontSize:'30rpx'}" title="推送设置" :arrow="false">
				<u-switch slot="right-icon" active-color="#FFBA37" v-model="checked" @change="change"></u-switch>
			</u-cell-item>
		</u-cell-group>
		<u-gap height="20" bg-color="#F6F6F6"></u-gap>
		<u-cell-group :border="false">
			<u-cell-item @click="jump('../public/addAccount?type=changeMobile')" :titleStyle="{fontSize:'30rpx'}" title="修改手机"></u-cell-item>
			<!-- <u-cell-item @click="jump('../public/addAccount?type=changeWx')" :border-bottom="false" :titleStyle="{fontSize:'30rpx'}"
			 title="更换微信"></u-cell-item> -->
		</u-cell-group>
		<u-gap height="20" bg-color="#F6F6F6"></u-gap>
		<u-cell-group :border="false">
			<u-cell-item :border-bottom="false" @click="clearCache" :value="cache" :titleStyle="{fontSize:'30rpx'}" title="清除缓存"></u-cell-item>
		</u-cell-group>
		<u-gap height="20" bg-color="#F6F6F6"></u-gap>
		<view class="footbtn" @click="jump('account')"><text>账号管理</text></view>
		<u-gap height="20" bg-color="#F6F6F6"></u-gap>
		<view class="footbtn" v-if="hasLogin" @click="showModel=true"><text style="color: #FB3034;">安全退出</text></view>
		<u-modal confirm-color="#FFBA37" :show-cancel-button="true" v-model="showModel" @confirm="outlogin" content="是否退出登录"></u-modal>
		<u-modal v-model="showFaceModel" :show-cancel-button="true" @confirm="inter(1)">
			<view class="u-padding-30 u-text-center">
				<view>请录入本人人脸，上传后<text class="u-type-error">不可修改</text></view>
			</view>
		</u-modal>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	import face from "@/util/js/face.js"
	export default {
		computed: {
			...mapState(['hasLogin', 'userInfo', 'pushState', 'checkedSecurity'])
		},
		data() {
			return {
				showModel: false,
				showSecurity: false,
				checked: false,
				password: [],
				screenWidth: '', //屏幕宽度
				screenHeight: '', //屏幕高度
				confirmEnable: false, //是否确认可点击
				cache: '当前缓存(0kb)',
				showFaceModel: false,
				checkedSec: false, //安全设置
				checkLoading: false,
				controlStatus: false
			};
		},
		onLoad() {
			this.checked = this.pushState
			this.checkedSec = this.checkedSecurity
			this.getScreenHeight();
			this.getChahe();
		},
		onShow() {

		},
		watch: {
			checkedSec(val) {
				let _self = this;
				if (val == false) {
					
					if (this.controlStatus == true) {
						this.controlStatus = false;
						return;
					}
					// 重新打开switch，并让它处于加载中的状态
					this.controlStatus = true;
					this.checkedSec = true;
					this.checkLoading = true;
					// 模拟向后端发起请求
					if (this.userInfo.face_token) {
						face.contrastSuccess = function() {
							
							_self.checkedSec = false;
							_self.checkLoading = false;
							_self.setSecurity(val)
							_self.controlStatus = true;
						}
						face.contrastError = function() {
							_self.checkedSec = true;
							_self.checkLoading = false;
						}
						face.inter(1)
					} else {
						_self.controlStatus = true;
						this.showFaceModel = true;
						this.checkedSec = false
					}
				}
			}
		},
		methods: {
			...mapMutations(['logout', 'pushChange', 'setSecurity']),
			inter(idx) {
				face.inter(idx)
			},
			changeSecurity(status) {
				let _self = this;
				if (status == true) {
					if (this.controlStatus == true) {
						this.controlStatus = false;
						return;
					}
					this.controlStatus = true;
					this.checkLoading = true;
					this.checkedSec = false;
					console.log('打开')
					// 模拟向后端发起请求
					if (this.userInfo.face_token) {
						face.contrastSuccess = function() {
							
							_self.checkedSec = true;
							_self.checkLoading = false;
							_self.setSecurity(_self.checkedSec)
							_self.controlStatus = false;
						}
						face.contrastError = function() {
							_self.checkedSec = false;
							_self.checkLoading = false;
						}
						face.inter(1)
					} else {
						_self.controlStatus = true;
						this.showFaceModel = true;
						this.checkedSec = false
					}
				}

			},
			change(status) {
				this.pushChange(status)
			},
			getScreenHeight() {
				//测量屏幕宽度（得到的是px单位）
				const deviceInfo = uni.getSystemInfoSync();
				this.screenWidth = deviceInfo.screenWidth;
			},
			securitySetting() {
				if (this.hasLogin) {
					this.showSecurity = true;
				} else {
					uni.navigateTo({
						url: '../public/login'
					})
				}
			},

			outlogin() {
				this.logout();
				uni.switchTab({
					url: '../index/index'
				})
			},
			jump(url) {
				uni.navigateTo({
					url: url
				})
			},
			getChahe() {
				var that = this;
				plus.cache.calculate(function(size) { //size是多少个字节单位是b
					//你可以做下面相应的处理
					if (size < 1024) {
						that.cache = '当前占用(' + size + 'B)';
					} else if (size / 1024 >= 1 && size / 1024 / 1024 < 1) {
						that.cache = '当前占用(' + Math.floor(size / 1024 * 100) / 100 + 'KB)';
					} else if (size / 1024 / 1024 >= 1) {
						that.cache = '当前占用(' + Math.floor(size / 1024 / 1024 * 100) / 100 + 'M)';
					}

				});
			},
			clearCache() {
				//可以询问用户是否删除
				let that = this;
				uni.showModal({
					title: '提示',
					content: '确定清除缓存吗?',
					success(res) {
						// 用户确定要删除
						if (res.confirm) {
							//使用plus.cache.clear 清除应用中的缓存数据 这里清除后还要二十几KB没有清除，达不到全部清除
							plus.cache.clear(function(e) {
								uni.showToast({
									title: '清除成功',
									icon: 'none',
									success() {
										that.cache = '当前占用(0B)';
										//成功后处理
									}
								})
							});
						}
					}
				})
			},
		}
	}
</script>

<style lang="scss">
	page {
		background: #F6F6F6;
	}

	.footbtn {
		text-align: center;
		font-size: 32rpx;
		background: #FFF;
		height: 90rpx;
		line-height: 90rpx;
	}

	.lock-tips {
		height: 90rpx;
		padding: 20rpx 0;
		margin: 0 !important;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		justify-content: center;
	}

	.big-tips {
		font-size: 32rpx;
		color: #333333;
		text-align: center;
		font-weight: 500;
	}

	.small-tips {
		font-size: 24rpx;
		color: #999999;
		text-align: center;
		font-weight: 500;
		margin-top: 5rpx;
	}

	.container-lock {
		background-color: #FCFCFC;
	}

	.container-confirm {
		display: flex;
		width: 100%;
		height: 16%;
		position: absolute;
		bottom: 0;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		text-align: center;

		view {
			color: #666666;
			font-size: 28rpx;
			font-weight: 500;
			text-align: center;
			flex: 1;
			width: 80%;
			margin: 0 5%;
			height: 100rpx;
			line-height: 100rpx;
			border: 1px solid #F0F0F0;
			border-radius: 50rpx;
		}

		.disable-confirm {
			color: #A0A0A0;
			background-color: #F5F5F5;
		}
	}
</style>
