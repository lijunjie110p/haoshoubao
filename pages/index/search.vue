<template>
	<view>
		<u-navbar back-icon-size="35" height="50" :border-bottom="false" :background="{backgroundColor:'#FFF'}" title="">
			<u-search @change="inputCondition" @search="screenGoods(subTabsIndex,true)" @custom="screenGoods(subTabsIndex,true)"
			 margin="0 20rpx" :action-style="{color:'#FFBA37',fontSize:'32rpx'}" :value="condition" placeholder="请输入搜索内容"></u-search>
		</u-navbar>
		<view class="subTabs">
			<u-tabs :is-scroll="false" gutter="570" bar-width="60" inactive-color="#333" bar-height="4" bg-color="#FFF" height="70"
			 name="title" duration="0.3" active-color="#FFBA37" :list="subTabs" :current="subTabsIndex" @change="screenGoods($event,true)"></u-tabs>
		</view>
		<u-gap height="80" bg-color="#FFF"></u-gap>
		<view class="goodsList">
			<view @click="lookDetails(item)" class="goodsitem" v-for="(item, i) in goodsDetailsData" :key="i">
				<view class="pic">
					<u-lazy-load threshold="-100" :image="item.pict_url" :index="i"></u-lazy-load>
				</view>
				<view class="info">
					<view>
						<text class="u-line-2 u-font-13 u-main-color">{{item.title}}</text>
					</view>
					<view class="u-flex u-row-between">
						<text class=" u-font-32 price">{{item.coupon_price}}</text>
						<text class="u-font-12 u-content-color">销量:{{item.volume}}</text>
					</view>
					<view>
						<text class="u-font-13 u-tips-color lineText">￥{{item.zk_final_price}}</text>
					</view>
					<view>
						<u-tag shape="circle" bg-color="#FFBA37" color="#FFF" border-color="#FFBA37" size="mini" :text="item.coupon_amount+'元卷'" />
					</view>
				</view>
			</view>
		</view>
		<u-loadmore v-if="goodsDetailsData!=''" font-size="30" margin-top="20" :load-text="{loadmore:'点击或上拉加载更多',loading: '努力加载中',nomore:'实在没有了'}"
		 :status="status" />
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				firstLoad: true,
				subTabsIndex: 0,
				status: 'loadmore',
				condition: '',
				appkey:'',
				subTabs: [{
						title: '综合',
						sort: ''
					},
					{
						title: '销量',
						sort: 'total_sales_des'
					},
					{
						title: '价格',
						sort: 'price_des'
					}
				],
				goodsDetailsData: '',
				page: 1,
			};
		},
		computed: { ...mapState(['forcedLogin', 'hasLogin', 'userInfo', 'isBindTaobao'])
		},
		onReachBottom() {
			this.loadMore();
		},
		onLoad(parms) {
			this.appkey = parms.appkey
		},
		methods: {
			inputCondition(condition) {
				this.condition = condition;
			},
			loadMore() {
				if (this.status == 'loadmore') {
					this.page++
					this.screenGoods(this.subTabsIndex, false)
				}
			},
			async screenGoods(index, isFirst) {
				if (isFirst) {
					uni.pageScrollTo({
						scrollTop: 0,
						duration: 100
					});
				}
				this.subTabsIndex = index;
				this.firstLoad = isFirst;
				if (this.condition == '') {
					uni.showToast({
						title: '请输入搜索条件',
						position: 'center',
						icon: 'none'
					})
					return;
				}
				uni.showLoading({
					mask: true,
					title: ''
				})
				this.status = 'loading'
				let e = await this.http.request({
					api_source: 'shop',
					uri: '/api/shop_home/items',
					method: 'POST',
					device: 'web',
					data: {
						keywords: this.condition,
						page: this.page,
						page_size: 10,
						sort: this.subTabs[this.subTabsIndex].sort,
						plat_flag: this.http.plat_flag
					}
				})
				if (e.data.status == 1) {
					if (this.firstLoad) {
						this.goodsDetailsData = e.data.body.list;
						this.firstLoad = false;
					} else {
						for (let i in e.data.body.list) {
							this.goodsDetailsData.push(e.data.body.list[i])
						}
					}
					if (e.data.body.list.length < 10) {
						this.status = 'nomore'
					} else {
						this.status = 'loadmore'
					}
				} else {
					uni.showToast({
						title: e.data.info,
						icon: "none"
					})
				}

				uni.hideLoading()
			},
			//查看商品详情
			lookDetails(item) {
				if (item.coupon_amount == 0) {
					this.openUrl(item.url)
				} else {
					uni.setStorageSync('item', JSON.stringify(item))
					uni.navigateTo({
						url: 'shopDetails?tqg=0&id=' + item.item_id + '&nick=' + item.nick
					})
				}
			},
			openUrl(url) {
				if (!this.hasLogin) {
					this.isLogin();
					return;
				}
				url = 'https:' + url;
				plug.openurl({
					url,
					linkkey: 'taobao',
					appkey: this.appkey,
					nativeFailedMode: 'download'
				}, result => {})
			},
		}
	}
</script>

<style lang="scss">
	.subTabs {
		width: 750rpx;
		background: #FFFFFF;
		position: fixed;
		left: 0;
		z-index: 999;
		right: 0;
		height: 80rpx;
	}

	.goodsList {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		background: #f2f2f2;

		.goodsitem {
			background: #FFF;
			margin: 20rpx;
			border-radius: 5px;
			overflow: hidden;
			width: 335rpx;

			.pic {
				height: 335rpx;
				overflow: hidden;

				image {
					width: 100%;
					height: auto;
					will-change: transform;
				}
			}


			.info {
				padding: 20rpx;

				.price {
					font-weight: 500;
					color: #FFBA37;
				}

				.price:after {
					content: '卷后';
					font-size: 24rpx;
					color: #FFBA37;
					margin-left: 2px;
				}

				.lineText {
					text-decoration: line-through;
				}
			}
		}
	}
</style>
