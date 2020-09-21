<template>
	<view>
		<view>
			<view>
				<!-- 轮播图 -->
				<view class="banner">
					<u-swiper border-radius="0" img-mode="widthFix" height="750" :list="bannerList" @click="previewImage"></u-swiper>
				</view>
				<view class="shop-info">
					<view class="u-flex u-row-between">
						<view>
							<text class="u-font-40  u-type-error" style="font-weight: bold;">￥{{resdata.coupon_price}}</text>
							<text class="u-font-14 u-type-info u-margin-left-10" style="text-decoration: line-through;">￥{{resdata.reserve_price}}</text>
						</view>
						<view>
							<text class="u-font-14 u-type-info">销量：{{resdata.volume}}</text>
						</view>
					</view>
					<view>
						<text class="u-line-3 u-font-32" style="font-weight: 500;">{{resdata.title}}</text>
					</view>
					<view class="roll-bg" v-if="isqg==0">

						<text class="u-type-error u-font-40" style="font-weight: bold;">￥{{resdata.coupon_amount}}</text>
						<view>
							<view><text class="u-font-13">优惠卷</text></view>
							<view><text class="u-font-12">{{resdata.coupon_start_time}}-{{resdata.coupon_end_time}}</text></view>
						</view>
						<view>
							<u-button shape="circle" type="warning" @click="buy">领劵</u-button>
						</view>

					</view>
				</view>
				<u-gap height="20" bg-color="#F2F2F2"></u-gap>
				<u-cell-group :border="false">
					<u-cell-item @click="openUrl(resdata.shopInfo.click_shop_url)" :title-style="{fontSize:'32rpx',color:'#333'}"
					 :value-style="{fontSize:'32rpx',color:'#333'}" :center="true" :border-top="false" :border-bottom="false" value="进入店铺"
					 :title="resdata.shopInfo.shop_title">
						<u-icon class="u-margin-right-10" style="border-radius: 5rpx;" slot="icon" size="50" :name="resdata.shopInfo.pict_url"></u-icon>
					</u-cell-item>
				</u-cell-group>
				<u-gap height="20" bg-color="#F2F2F2"></u-gap>
				<view class="goodsDetails">
					<view class="u-padding-20 u-font-32 ">宝贝详情</view>
					<view class="u-flex-col">
						<image v-for="(item,index) in bannerList" :key="index" mode="widthFix" :src="item.image"></image>
					</view>
				</view>
				<u-gap height="100" bg-color="#FFF"></u-gap>
				<view class="u-position-bottom foot">
					<view class="btn" @click="buy">
						<text>立即购买</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// #ifdef APP-PLUS
	const plug = uni.requireNativePlugin('UZK-Alibcsdk');
	// #endif
	export default {
		data() {
			return {
				resdata: {
					shopInfo: {}
				},
				bannerList: [],
				previewPic: [],
				isqg: '',
				url: '',
				appkey: ''
			};
		},
		onLoad(option) {
			// #ifdef APP-PLUS
			plug.init(result => {
				console.log(result)
			});
			// #endif
			this.url = option.url
			this.isqg = option.tqg;
			this.appkey = option.appkey;
			this.initData(option);
		},
		methods: {
			async initData(option) {

				if (option.tqg == "1") {
					let res = await this.http.request({
						api_source: 'shop',
						uri: '/api/shop_home/tqg_detail',
						method: 'POST',
						device: 'web',
						data: {
							item_id: option.id,
							plat_flag: this.http.plat_flag
						},
					})
					if (res.data.status == 1) {
						this.resdata = res.data.body;
						for (let i in this.resdata.small_images.string) {
							this.bannerList.push({
								image: this.resdata.small_images.string[i]
							})
							this.previewPic.push(this.resdata.small_images.string[i])
						}
					} else {
						uni.showToast({
							title: res.data.info,
							icon: "none"
						})
					}

				} else {
					let res = await this.http.request({
						api_source: 'shop',
						uri: '/api/shop_home/detail',
						method: 'POST',
						device: 'web',
						data: {
							item_id: option.id,
							shop_title: decodeURIComponent(option.nick),
							plat_flag: this.http.plat_flag
						},
					})
					if (res.data.status == 1) {
						this.resdata = JSON.parse(uni.getStorageSync('item'));
						this.resdata.shopInfo = res.data.body.shopInfo;
						for (let i in this.resdata.small_images.string) {
							this.bannerList.push({
								image: this.resdata.small_images.string[i]
							})
							this.previewPic.push(this.resdata.small_images.string[i])
						}
						this.resdata.coupon_start_time = this.$u.timeFormat(this.resdata.coupon_start_time, 'mm月dd日');
						this.resdata.coupon_end_time = this.$u.timeFormat(this.resdata.coupon_end_time, 'mm月dd日');
					} else {
						uni.showToast({
							title: res.data.info,
							icon: "none"
						})
					}

				}

			},
			previewImage(current) {
				uni.previewImage({
					current,
					urls: this.previewPic
				})
			},
			buy() {
				if (this.isqg == 1) {
					this.openUrl(this.url)
				} else if (this.resdata.coupon_amount != 0) {
					this.openUrl(this.resdata.coupon_share_url)
				}

			},
			openUrl(url) {
				url = 'https:' + url;
				plug.openurl({
					url,
					linkkey: 'taobao',
					appkey: this.appkey,
					nativeFailedMode: 'download'
				}, result => {
					console.log(result)
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		background: #F2F2F2;
	}

	.shop-info {
		background: #FFFFFF;
		padding: 20rpx;
	}

	.goodsDetails {
		background: #FFF;

		image {
			width: 100%;
			height: auto;
		}
	}

	.roll-bg {
		margin-top: 20rpx;
		background-image: url('https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-06-28/5ef84d0cec8e1.png');
		height: 120rpx;
		background-position: center;
		background-repeat: no-repeat;
		background-size: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 40rpx;

		button:after {
			border: none;
		}
	}

	.foot {
		position: fixed;
		left: 0;
		bottom: 0;
		right: 0;
		height: 100rpx;
		display: flex;
		justify-content: flex-end;
		background: #FFFFFF;

		.btn {
			height: 100rpx;
			line-height: 100rpx;
			background: $ez-theme-bg;
			color: #FFF;
			width: 300rpx;
			text-align: center;
			font-size: 32rpx;
			font-weight: 500;
		}
	}
</style>
