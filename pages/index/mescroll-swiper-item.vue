<template>
	<!-- 
	swiper中的transfrom会使fixed失效,此时用height="100%"固定高度; 
	swiper中无法触发mescroll-mixins.js的onPageScroll和onReachBottom方法,只能用mescroll-uni,不能用mescroll-body
	-->
	 <mescroll-uni ref="mescrollRef" @init="mescrollInit" :height="scrollerHeight"  :down="downOption" @down="downCallback" :up="upOption" @up="upCallback" @emptyclick="emptyClick">
		<!-- 数据列表 -->
		<view class="u-rela" v-if="index==0">
			<!-- 轮播图 -->
			<view class="banner">
				<u-swiper name="icon" height="300" :autoplay="autoplay" :list="home_data.advs" @click="bannerClick"></u-swiper>
			</view>
			<u-grid :col="5" :border="false">
				<u-grid-item v-for="(item,i) in home_data.top_active" :key="i" @click="openUrl(item.value)">
					<u-image shape="circle" width="70rpx" height="70rpx" @click="openUrl(item.value)" :src="item.icon"></u-image>
					<text class="u-font-13 u-margin-top-15">{{item.title}}</text>
				</u-grid-item>
			</u-grid>
			<!-- 活动 -->
			<view class="active u-flex u-flex-wrap">
				<view class="item u-flex u-row-center" v-for="(item,i) in home_data.index_two_active" :key="i" @tap="openUrl(item.value)">
					<u-image border-radius="5" width="340rpx" height="180rpx" @click="openUrl(item.value)" :src="item.icon"></u-image>
				</view>
			</view>
			<u-gap height="30" bg-color="#F2F2F2"></u-gap>
			<!-- 抢购 -->
			<view class="tqg">
				<view class="list-title"><text>淘抢购</text></view>
				<u-grid :col="5" :border="false" hover-class="none">
					<u-grid-item @click="tqgClick(i,item.q_time_all,item.q_time)" v-for="(item,i) in home_data.tqg_time_data" :key="i">
						<view class="item" :style="index==i?{background:'#FFBA37'}:{background:'#FFF'}">
							<view>
								<text :style="index==i?{color:'#FFF'}:{color:'#333'}" class="u-font-32"><b>{{item.q_time}}</b></text>
							</view>
							<view>
								<text :style="index==i?{color:'#FFF'}:{color:'#999'}" class="u-font-13">{{item.state_text}}</text>
							</view>
						</view>
					</u-grid-item>
				</u-grid>
			</view>
			<view class="tqg-list">
				<view class="tqg-list-item" v-for="(item,i) in tqgdata" :key="i" @click="tqgJump(item.num_iid,item.click_url)">
					<view>
						<u-image width="260rpx" height="260rpx" :src="item.pic_url"></u-image>
					</view>
					<view class="tqg-list-item-info">
						<view>
							<text class="u-line-2 u-font-28"><b>{{item.title}}</b></text>
						</view>
						<view>
							<text class="s-price">{{item.reserve_price}}</text>
						</view>
						<view class="bottom-row">
							<view>
								<text class="price">{{item.zk_final_price}}</text>
							</view>
							<view>
								<u-button @click="tqgJump(item.num_iid,item.click_url)" :custom-style="tqgBtnStyle" shape="circle" :ripple="true">{{tqgBtnText}}</u-button>
							</view>
						</view>
					</view>
				</view>
			</view>
			<u-gap height="30" bg-color="#F2F2F2"></u-gap>
			<!-- 精选 -->
			<view class="tqg">
				<view class="list-title"><text>精选商品</text></view>
			</view>
			<view class="goodsList">
				<view class="goodsitem" v-for="(item,i) in home_data.list" :key="i" @click="lookDetails(item)">
					<view class="pic">
						<u-lazy-load threshold="-100" :image="item.pict_url" :index="i"></u-lazy-load>
					</view>
					<view class="info">
						<view>
							<text class="u-line-2 u-font-28"><b>{{item.title}}</b></text>
						</view>
						<view><text class="s-price">{{item.zk_final_price}}</text></view>
						<view class="u-flex u-row-between">
							<view>
								<text class="price">{{item.coupon_price}}</text>
							</view>
							<view>
								<u-tag shape="circle" bg-color="#FFBA37" color="#FFF" border-color="#FFBA37" size="mini" :text="item.coupon_amount+'元卷'" />
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="panel" v-else>
			<view class="subClass">
				<u-grid :col="5" :border="false" hover-class="none">
					<u-grid-item @click="screenGoods(subTabsIndex,item.value,true,i)" bg-color="#FFF" v-for="(item,i) in tablist[index].children"
					 :key="i">
						<u-image @click="screenGoods(subTabsIndex,item.value,true,i)" shape="circle" width="80rpx" height="80rpx" :src="item.icon"></u-image>
						<text class="u-font-12" :style="gridItemIndex==i?{color:'#FFBA37'}:{color:'#333'}">{{item.title}}</text>
					</u-grid-item>
				</u-grid>
			</view>
		
			<view class="subTabs">
				<u-tabs :is-scroll="false" gutter="570" bar-width="60" inactive-color="#333" bar-height="4" bg-color="#FFF"
				 height="70" name="title" duration="0.3" active-color="#FFBA37" :list="subTabs" :current="subTabsIndex" @change="screenGoods($event,goodsClassId,true)"></u-tabs>
			</view>
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
		</view>
	</mescroll-uni>
</template>

<script>
	import MescrollMixin from "@/components/mescroll-uni/mescroll-mixins.js";
	import MescrollMoreItemMixin from "@/components/mescroll-uni/mixins/mescroll-more-item.js";
	import {
		mapState
	} from 'vuex'
	
	export default {
		mixins: [MescrollMixin,MescrollMoreItemMixin], // 注意此处还需使用MescrollMoreItemMixin (必须写在MescrollMixin后面)
		data() {
			return {
				downOption:{
					auto:false // 不自动加载 (mixin已处理第一个tab触发downCallback)
				},
				autoplay: true,
				upOption:{
					auto:false, // 不自动加载
					page: {
						num: 1, // 当前页码,默认0,回调之前会加1,即callback(page)会从1开始
						size: 20 // 每页数据的数量
					},
					noMoreSize: 4, //如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
					empty:{
						tip: '~ 空空如也 ~', // 提示
						btnText: '去看看'
					}
				},
					
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
					subTabsIndex: 0,
					gridItemIndex: 0,
					opentbasIcon: false, //tabs弹窗
					page: 1,
					tqgIndex: 2,
					tqgdata: {}, //抢购数据
					tqgBtnText: '立即抢购',
					tqgBtnStyle: {
						background: '#FFBA37',
						color: '#FFF',
						fontSize: '28rpx',
						padding: '0 30rpx',
						border: 'none'
					},
					alertAnimation: {},
					alertTop: '', //弹窗距离顶部高度 
					status: 'loadmore', //加载更多
					firstLoad: true, //是否第一次加载
					scrollTop: 0, //滚动条距离顶部距离
					oldScrollTop: 0,
					goodsDetailsData: [],
					adCondition: '', //升序降序
					goodsClassId: '', //商品分类id
					autoplay: true,
					isloading: false,
					triggered: false,
					appkey: '',
					upOption: {
						page: {
							size: 10 // 每页数据的数量,默认10
						},
						noMoreSize: 5, // 配置列表的总数量要大于等于5条才显示'-- END --'的提示
						empty: {
							tip: '~ 搜索无数据 ~'
						},
						textNoMore: '已经到底了',
						auto: false,
					},
					downOption: {
						auto: false
					},
				
			}
		},
		props:{
			scrollerHeight:'',
			i: Number, // 每个tab页的专属下标 (除了支付宝小程序必须在这里定义, 其他平台都可不用写, 因为已在MescrollMoreItemMixin定义)
			index: { // 当前tab的下标 (除了支付宝小程序必须在这里定义, 其他平台都可不用写, 因为已在MescrollMoreItemMixin定义)
				type: Number,
				default(){
					return 0
				}
			},
			tabs: { // 为了请求数据,演示用,可根据自己的项目判断是否要传
				type: Array,
				default(){
					return []
				}
			},
			home_data:{},
			tqgdata:{}
		},
		computed: { ...mapState(['forcedLogin', 'hasLogin', 'userInfo', 'isBindTaobao'])},
		methods: {
			/*下拉刷新的回调 */
			downCallback() {
				// 这里加载你想下拉刷新的数据, 比如刷新轮播数据
				// loadSwiper();
				// 下拉刷新的回调,默认重置上拉加载列表为第一页 (自动执行 page.num=1, 再触发upCallback方法 )
				this.mescroll.resetUpScroll()
				console.log('下拉刷新了')
			},
			/*上拉加载的回调: 其中page.num:当前页 从1开始, page.size:每页数据条数,默认10 */
			upCallback(page) {
				//联网加载数据
				this.getHomeData();
				console.log('上拉加载了')
			},
			//点击空布局按钮的回调
			emptyClick(){
				uni.showToast({
					title:'点击了按钮,具体逻辑自行实现'
				})
			},
			bannerClick(index) {
				let url = this.home_data.advs[index].url
				this.openUrl(url);
			},
			async getHomeData() {
				this.status = 'loading'
				uni.showLoading({
					mask: true,
					title: ''
				})
				let e = await this.http.request({
					api_source: 'shop',
					uri: '/api/shop_home/index',
					method: 'POST',
					device: 'web',
					data: {
						page: this.page,
						page_size: 20,
						plat_flag: this.http.plat_flag
					}
				})
				if (e.data.status == 1) {
					if (e.data.body.list.length < 20) {
						this.status = 'nomore'
					} else {
						this.status = 'loadmore'
					}
					if (this.firstLoad) {
						this.home_data = e.data.body
						for (var i in this.home_data.tqg_time_data) {
							if (this.home_data.tqg_time_data[i].state == 2) {
								this.startTime = this.home_data.tqg_time_data[i].q_time_all;
							}
						}
						this.getTqgData(this.startTime)
						this.firstLoad = false;
						this.triggered = false;
					} else {
						this.home_data.list = this.home_data.list.concat(e.data.body.list)
					}
			
				}
			
				uni.hideLoading()
			},
			tqgJump(id, url) {
				if (!this.hasLogin) {
					this.isLogin();
					return;
				}
				if (!this.isBindTaobao) {
					this.loginTaobao();
					return;
				}
				if (this.index == 2) {
					uni.navigateTo({
						url: 'shopDetails?tqg=1&id=' + id + '&url=' + encodeURIComponent(url)
					})
				} else if (this.index < 2) {
					uni.showToast({
						title: '已过抢购时间',
						position: 'center',
						icon: 'none'
					})
				} else if (this.index > 2) {
					uni.showToast({
						title: '未到抢购时间',
						position: 'center',
						icon: 'none'
					})
				}
			},
			openUrl(url) {
				if (!this.hasLogin) {
					this.isLogin();
					return;
				}
				if (!this.isBindTaobao) {
					this.loginTaobao();
					return;
				}
				plug.openurl({
					url,
					linkkey: 'taobao',
					appkey: this.appkey,
					nativeFailedMode: 'download'
				}, result => {
					console.log(result)
				})
			},
		}
	}
</script>
