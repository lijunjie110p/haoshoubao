<template>
	<view class="main">
		<view v-for="(item,index) in list" :key="index">
			<view class="item">
				<view>
					<u-avatar :src="item.headpic" size="80"></u-avatar>
				</view>
				<view class="content">
					<view class="title"><text class="u-font-32"><b>{{item.title}}</b></text></view>
					<view class="text">
						<rich-text :nodes="item.content"></rich-text>
					</view>
					<view class="u-margin-top-20">
						<canvas @click="previewImage(index)" :style="{'width':canvas.w,'height': canvas.h}" :canvas-id="'canvas'+index"></canvas>
					</view>
					<view class="u-flex u-row-between u-margin-top-20" style="width: 400rpx;">
						<view class="u-flex u-col-center" @click="showSharePopup(item)">
							<u-icon size="36" color="#FFBA37" name="zhuanfa"></u-icon>
							<text class="u-type-info-dark u-font-28 u-margin-left-5">分享素材</text>
						</view>
						<view class="u-flex u-col-center" @click="download(previewPic[index])">
							<u-icon size="36" color="#FFBA37" name="download"></u-icon>
							<text class="u-type-info-dark u-font-28 u-margin-left-5">下载素材</text>
						</view>
					</view>
				</view>

			</view>
			<u-gap height="20" bg-color="#F2F2F2"></u-gap>
		</view>
		<u-popup mode="bottom" border-radius="15" v-model="showShare" :closeable="true">
			<view class="u-font-36 u-content-color u-padding-top-30 u-text-center">
				<text>分享至</text></view>
			<view class="u-padding-30 white-bg u-flex u-row-between u-text-center u-col-center">
				<view class="u-flex-1">
					<u-icon name='weixin-circle-fill' @click="share(1)" size="90" color="#2b9939"></u-icon>
					<view><text class="u-font-30 u-margin-top-15">微信好友</text></view>
				</view>
				<view class="u-flex-1">
					<u-icon name='moments-circel-fill' @click="share(2)" size="90" color="#2b9939"></u-icon>
					<view><text class="u-font-30 u-margin-top-15">微信朋友圈</text></view>
				</view>
			</view>
			<view class="u-padding-30 u-text-center u-border-top" @click="showShare=false"><text class="u-font-36">取消</text></view>
		</u-popup>
		<u-loadmore font-size="30" margin-top="20" :load-text="{loadmore:'点击或上拉加载更多',loading: '努力加载中',nomore:'已经到底了~'}"
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
				page: 1,
				list: {},
				mycode: {},
				firsLoad: true,
				status: 'loadmore', //加载更多
				previewPic: [],
				canvas: {
					w: '',
					h: ''
				},
				showShare: false,
				shareCofig: {}
			};
		},
		onLoad() {

		},
		onShow() {
			this.page = 1
			this.firsLoad = true;
			this.initData();
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		onPullDownRefresh() {
			this.page = 1
			this.firsLoad = true;
			this.initData();
		},
		onReachBottom() {
			this.onreachBottom()
		},
		methods: {
			isLogin() {
				if (!this.hasLogin) {
					uni.showModal({
						title: '未登录',
						content: '您未登录，需要登录后才能继续',
						/**
						 * 如果需要强制登录，不显示取消按钮
						 */
						showCancel: true,
						success: (res) => {
							if (res.confirm) {
								uni.navigateTo({
									url: '../public/login'
								});
							}
						}
					});
				}
			},
			isAuditing() {
				if (this.userInfo.is_auditing != '2') {
					uni.showModal({
						title: '未认证',
						content: '您未认证，需要认证后才能继续',
						/**
						 * 如果需要强制登录，不显示取消按钮
						 */
						showCancel: true,
						success: (res) => {
							if (res.confirm) {
								uni.navigateTo({
									url: '../public/security'
								});
							}
						}
					});
				}
			},
			onreachBottom() {
				if (this.status == 'loadmore') {
					this.page++
					this.firsLoad = false;
					this.initData()
				}
			},
			previewImage(current) {
				if (this.previewPic[current] != '') {
					uni.previewImage({
						current,
						urls: this.previewPic,
						longPressActions: true
					})
				}
			},
			download(url) {
				uni.showActionSheet({
					itemList: ['保存到相册'],
					success(tapIndex) {
						if (tapIndex.tapIndex == 0) {
							uni.getImageInfo({
								src: url,
								success(e) {
									uni.saveImageToPhotosAlbum({
										filePath: e.path,
										success(r) {
											uni.showToast({
												title: '下载成功',
												position: 'center',
												icon: 'none'
											})
										},
										fail(f) {
											uni.showToast({
												title: '下载素材失败',
												position: 'center',
												icon: 'none'
											})
										}
									})
								}
							})
						}
					},
				})
			},
			showSharePopup(item) {
				this.shareCofig = item;
				this.showShare = true
			},
			share(type) {
				let scene = type == 1 ? "WXSceneSession" : "WXSenceTimeline",
					title = type == 1 ? this.shareCofig.title : this.shareCofig.content.replace(/<br>/g, ',');

				uni.share({
					provider: 'weixin',
					title: title,
					imageUrl: this.shareCofig.headpic,
					scene: scene,
					type: 0,
					href: this.mycode.url,
					summary: this.shareCofig.content.replace(/<br>/g, ','),
					success(e) {
						uni.showToast({
							title: '分享成功',
							position: 'center',
							icon: 'none'
						})
						if (type == 2) {
							uni.setClipboardData({
								data: title,
								success(e) {
									uni.showToast({
										title: '分享内容已粘贴'
									})
								}
							});
						}
					},
					fail(err) {
						uni.showToast({
							title: JSON.stringify(err),
							position: 'center',
							icon: 'none'
						})
					}
				})
			},
			async initData() {
				let that = this;
				if (!this.hasLogin) {
					this.isLogin()
					return;
				}

				if (this.userInfo.is_auditing != '2') {
					this.isAuditing()
					return;
				}

				this.status = 'loading'
				let res = await this.http.request({
					api_source: 'app',
					uri: '/Find/details',
					method: 'POST',
					device: 'web',
					data: {
						fid: 20,
						page: this.page,
						uid: this.userInfo.uid,
					}
				})
				if (res.data.status == 1) {
					if (res.data.body.img_list.length < 10) {
						this.status = 'nomore'
					} else {
						this.status = 'loadmore'
					}
					this.previewPic = [];
					this.mycode = res.data.body.mycode

					for (let j in res.data.body.img_list) {
						let title = res.data.body.img_list[j].title.replace(/\\n/g, '<br>')
						res.data.body.img_list[j].headpic = title.split("|")[0]
						res.data.body.img_list[j].title = title.split("|")[1]
						res.data.body.img_list[j].content = title.split("|")[2]

					}
					if (this.firsLoad) {

						this.list = res.data.body.img_list
					} else {
						this.list = this.list.concat(res.data.body.img_list)
					}
					for (let j in this.list) {
						let url = await this.applyWorkMark(j, this.mycode.code_img)
						
						if (url) {
							this.previewPic.push(url);
						}
					}
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
				uni.stopPullDownRefresh();
			},
			// 水印
			applyWorkMark(i, codeimg) {
				var that = this;
				return new Promise((resolve, reject) => {
					uni.getImageInfo({
						src: that.list[i].imgurl,
						success(e) {
							that.canvas.w = e.width / 2 + 'rpx';
							that.canvas.h = e.height / 2 + 'rpx';
							// 将图片src放到cancas内，宽高为图片大小
							uni.getImageInfo({
								src: codeimg,
								success(r) {
									let ctx = uni.createCanvasContext('canvas' + i); /** 创建画布 */
									ctx.drawImage(e.path, 0, 0, e.width / 4, e.height / 4)
									ctx.drawImage(r.path, e.width / 12, e.height / 4 - e.width / 6, e.width / 12, e.width / 12)
									ctx.draw(false, () => {
										uni.canvasToTempFilePath({
											canvasId: 'canvas' + i,
											success: (res1) => {
												resolve(res1.tempFilePath);
											},
											fail: (res1) => {
												that.$u.toast(res1)
											}
										});
									});
								},
								fail: (res1) => {
									that.$u.toast(res1)
								}
							})
						},
						fail: (res1) => {
							that.$u.toast(res1)
						}
					})
				})
			}
		}
	}
</script>

<style lang="scss">
	.item {
		display: flex;
		padding: 30rpx;
		background: #fff;

		.content {
			margin-left: 30rpx;
			flex: 1;

			.title {
				height: 80rpx;
				line-height: 80rpx;
			}

			.text {}
		}
	}
</style>
