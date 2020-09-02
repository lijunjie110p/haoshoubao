<!-- 升级弹窗 -->
<template>
	<view class="main">
		<view class="line u-flex u-flex-col u-col-center u-row-center" >
			<view class="u-font-33 u-text-center">更新中...</view>
			<u-line-progress type="warning" :striped="true" :striped-active="true" height="35" :percent="percent"></u-line-progress>
		</view>
		
	</view>
</template>
<script>
	export default {
		data() {
			return {
				downloadUrl: '',
				versionData: {},
				percent: 0,
			}
		},
		onLoad() {
			this.getVersion()
		},
		onReady() {
			let that = this
		},
		methods: {
			async getVersion() {
				let that = this;
				await plus.runtime.getProperty(plus.runtime.appid, async function(inf) {
					var ver = inf.version,
						type = '';
					if (uni.getSystemInfoSync().platform == 'ios') {
						type = 1;
					} else {
						type = 2
					}
					let res = await that.http.request({
						api_source: 'app',
						uri: '/Manage/update_app',
						method: 'POST',
						device: 'web',
						data: {
							type_app: type
						}
					})
					if (res.data.status == 1) {
						that.versionData = res.data.body
						if (ver != that.versionData.version) {
							that.downloadUrl = that.versionData.url;
							var downloadTask  = uni.downloadFile({ //执行下载
								url: that.downloadUrl,
								success: downloadResult => { //下载成功
									if (downloadResult.statusCode === 200) {
										plus.runtime.install( //安装
											downloadResult.tempFilePath, {
												force: true
											},
											function() {
												// utils.showToast('更新成功，重启中');
												plus.runtime.restart();
											},
											function(e) {
												// utils.showToast('更新失败');
											}
										);
									}
								},
								complete: () => {
									uni.hideLoading();
								}
							});
							downloadTask.onProgressUpdate((res) => {
								that.percent = res.progress
							});
						}
					} else {
						uni.showToast({
							title: res.data.info,
							icon: "none"
						})
					}
				})

			},

			confirm() {},
		}
	}
</script>

<style scoped lang="scss">
	@import "@/components/uview-ui//libs/css/style.components.scss";
	
	.line{
		height: 1000rpx;
		padding: 100rpx 30rpx;
	}
	.u-full-content {
		background-color: #00C777;
	}

	.u-update-content {
		font-size: 26rpx;
		color: $u-content-color;
		line-height: 1.7;
		padding: 30rpx;
	}
</style>
