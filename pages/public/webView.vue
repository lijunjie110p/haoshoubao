<template>
	<view class="main">
		<web-view :webview-styles="webviewStyles" :src="webviewUrl" @message="message"></web-view>
	</view>
</template>

<script>
	import share from "@/util/js/share.js";
	import {
		mapState
	} from 'vuex';
	export default {
		data() {
			return {
				webviewStyles: {
					progress: {
						color: '#FFBA37'
					}
				},
				webviewUrl: '',
				source: '',
				lastRoute: '', //上个页面路由 
				lastRouteOptions: '', //上个页面参数
				pages: [],
				url: '',
				lastPageIndex: 0,
				showShare: false,
			};
		},
		onNavigationBarButtonTap(e) {
			if (e.index == 0) {
				this.finishPage()
			}
		},
		computed: {
			...mapState(['userInfo'])
		},
		onReady() {},
		onLoad(parms) {
			let pages = getCurrentPages();
			this.pages = pages;
			this.lastPageIndex = this.pages.length - 2;
			this.lastRoute = this.pages[this.lastPageIndex].route;
			this.lastRouteOptions = this.pages[this.lastPageIndex].options;
			this.source = parms.source;
			this.url = decodeURIComponent(parms.url)
			this.webviewUrl = this.url;
		},
		methods: {
			finishPage() {
				if (this.lastRoute.indexOf('channel') != -1) {
					this.lastRoute = this.lastRoute + '?card_id=' + this.lastRouteOptions.card_id + '&source=' + this.lastRouteOptions
						.source
				}
				if (this.lastPageIndex >= 2) {
					uni.redirectTo({
						url: '/' + this.lastRoute,
						success() {
							uni.navigateBack()
						}
					})
				} else {
					uni.navigateBack()
				}
			},
			async message(event) {
				let _self = this;
				if (event.detail.data[0].finish) {
					this.finishPage();
				}
				if (event.detail.data[0].jumpApp) {
					if (event.detail.data[0].jumpApp.model == 'tabbar') {
						uni.switchTab({
							url: '/' + event.detail.data[0].jumpApp.url
						})
					}
					if (event.detail.data[0].jumpApp.model == 'card') {
						uni.redirectTo({
							url: '../card/card',
							success() {
								uni.navigateBack()
							}
						})
					}

				}
				if (event.detail.data[0].pay) {
					uni.requestPayment({
						provider: 'wxpay',
						orderInfo:event.detail.data[0].pay.config, 
						success: function(res) {
							_self.$u.toast('支付成功')
							uni.redirectTo({
								url:'webView?url='+_self.webviewUrl
							})
						}, 
						fail: function(err) {
							_self.$u.toast('支付失败')
						}
					}) 
				}
				if (event.detail.data[0].share) {
					this.showShare = true;
					this.shareConfig = event.detail.data[0].share.config
					this.shareWx(1)
				}
			},
			shareWx(type) {
				let shareInfo = {
					href: this.shareConfig.url,
					title: this.shareConfig.title,
					desc: this.shareConfig.content,
					imgUrl: this.shareConfig.imgurl
				};
				let shareList = [{
						icon: "https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-08-20/5f3e44b436019.png",
						text: "微信好友",
					},
					{
						icon: "https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-08-20/5f3e44bf23cc7.png",
						text: "朋友圈"
					}
				];
				this.shareObj = share(shareInfo, shareList, function(index) {
					console.log("点击按钮的序号: " + index);
					let shareObj = {
						href: shareInfo.href || "",
						title: shareInfo.title || "",
						summary: shareInfo.desc || "",
						success: (res) => {
							console.log("success:" + JSON.stringify(res));
						},
						fail: (err) => {
							console.log("fail:" + JSON.stringify(err));
						}
					};
					
					switch (index) {
						case 0: 
							shareObj.provider = "weixin";
							shareObj.scene = "WXSceneSession";
							shareObj.type = 0;
							shareObj.imageUrl = shareInfo.imgUrl || "";
							uni.share(shareObj);
							break;
						case 1:
							shareObj.provider = "weixin";
							shareObj.scene = "WXSenceTimeline";
							shareObj.type = 0;
							shareObj.imageUrl = shareInfo.imgUrl || "";
							uni.setClipboardData({
								data: shareInfo.desc,
								complete() {
									uni.showToast({
										title: "已复制到剪贴板"
									})
								}
							})
							uni.share(shareObj);
							break;
					};
				});
				this.$nextTick(() => {
					this.shareObj.alphaBg.show();
					this.shareObj.shareMenu.show();
				})
			},
		}
	}
</script>

<style lang="scss">
	page {
		background: #F2F2F2;
	}
</style>
