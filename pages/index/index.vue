<template>
	<view class="main">
		<!-- 顶部按钮 -->
		<view class="head">
			<view class="topbtn u-flex u-row-between u-col-center u-padding-30">
				<view v-for="(item,i) in topgrid" class="u-flex-1 u-text-center u-flex u-row-between u-flex-col" :key="i" @click="jump(item.url)">
					<u-image width="55rpx" height="55rpx" @click="jump(item.url)" :src="item.icon"></u-image>
					<text class="u-font-28 u-margin-top-20 font-blod">{{item.title}}</text>
				</view>
			</view>
			<!-- 轮播图 -->
			<view class="banner">
				<u-swiper name="icon" height="250" :autoplay="autoplay" :list="home_data.advs" @click="bannerClick"></u-swiper>
			</view>
			<view class="tabs">
				<view style="width: 650rpx;">
					<u-tabs ref="uTabs" bar-width="100" inactive-color="#030400" bar-height="6" bg-color="#FFF" height="60" name="title"
					 duration="0.3" active-color="#030400" :bar-style="{background:'#FFBA37'}" :list="tablist" :current="tabsIndex"
					 @change="changeNavbar"></u-tabs>
				</view>
				<view style="width: 100rpx;text-align: center;" class="u-flex-col u-col-center u-row-center">
					<u-icon @click="openTabasAlert" :name="opentbasIcon?'arrow-up':'arrow-down'" color="#030400" size="30"></u-icon>
				</view>
			</view>
		</view>
		<u-modal v-model="showFaceModel" :show-cancel-button="true" @confirm="inter(1)">
			<view class="u-padding-30 u-text-center">
				<view>请录入本人人脸，<text class="u-type-error">上传后不可修改</text></view>
			</view>
		</u-modal>
		<u-modal v-model="showIdCardModel" :show-cancel-button="true" @confirm="chooseImage">
			<view class="u-padding-30 u-text-center">
				<view>请上传手持身份证照片，<text class="u-type-error">上传后不可修改</text></view>
			</view>
		</u-modal>

		<!-- tabs弹出层 -->
		<view class="u-abso tabas-panel-alert" :style="{top:alertTop+'px',maxHeight:scrollerHeight+'px'}" v-if="opentbasIcon">
			<view style="background: #FFFFFF;overflow: hidden;" :animation="alertAnimation">
				<u-grid :col="5" :border="false">
					<u-grid-item v-for="(item,i) in tablist" :key="i" @click="changeNavbar(i)" v-if="i!=0">
						<u-image shape="circle" width="80rpx" height="80rpx" @click="changeNavbar(i)" :src="item.icon"></u-image>
						<text class="u-font-12">{{item.title}}</text>
					</u-grid-item>
				</u-grid>
			</view>
		</view>
		<mescroll-uni ref="mescrollRef" @init="mescrollInit" :height="scrollerHeight" :down="downOption" @down="downCallback"
		 :up="upOption" @up="upCallback">
			<view class="content">
				<view class="u-rela homeshop" v-if="tabsIndex==0">

					<u-grid :col="5" :border="false">
						<u-grid-item v-for="(item,i) in home_data.top_active" :key="i" @click="openUrl(item.value)">
							<u-image shape="circle" width="70rpx" height="70rpx" @click="openUrl(item.value)" :src="item.icon"></u-image>
							<text class="u-font-13 u-margin-top-15">{{item.title}}</text>
						</u-grid-item>
					</u-grid>
					<!-- 活动 -->
					<view class="active u-flex u-flex-wrap">
						<view class="item u-flex u-row-center" v-for="(item,i) in home_data.index_two_active" :key="i" @tap="openUrl(item.value)">
							<u-image border-radius="5" width="340rpx" height="150rpx" mode="widthFix" @click="openUrl(item.value)" :src="item.icon"></u-image>
						</view>
					</view>
					<!-- 抢购 -->
					<view class="tqg">
						<view class="list-title"><text>淘抢购</text></view>
						<u-grid :col="5" :border="false" hover-class="none">
							<u-grid-item @click="tqgClick(i,item.q_time_all,item.q_time)" v-for="(item,i) in home_data.tqg_time_data" :key="i">
								<view class="item" :style="tqgIndex==i?{background:'#FFBA37'}:{background:'#FFF'}">
									<view>
										<text :style="tqgIndex==i?{color:'#FFF'}:{color:'#333'}" class="u-font-32"><b>{{item.q_time}}</b></text>
									</view>
									<view>
										<text :style="tqgIndex==i?{color:'#FFF'}:{color:'#999'}" class="u-font-13">{{item.state_text}}</text>
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
						<view class="goodsitem" v-for="(item,i) in choiceness" :key="i" @click="lookDetails(item)">
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
										<u-tag shape="circle" bg-color="#FFBA37" color="#FFF" border-color="#FFBA37" size="mini" :text="item.coupon_amount+'元券'" />
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="panel" v-else>
					<view class="subClass">
						<u-grid :col="5" :border="false" hover-class="none">
							<u-grid-item @click="screenGoods(subTabsIndex,item.value,true,i)" bg-color="#FFF" v-for="(item,i) in tablist[tabsIndex].children"
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
									<u-tag shape="circle" bg-color="#FFBA37" color="#FFF" border-color="#FFBA37" size="mini" :text="item.coupon_amount+'元券'" />
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</mescroll-uni>
		<helang-compress ref="helangCompress"></helang-compress>
		<u-popup border-radius="20" v-model="showNotice" mode="center" close-icon-color="#FFF"  :closeable="true">
			<view>
				<u-image :src="noticeData.param_img" @click="lookNotice" width="560rpx" height="730rpx" ></u-image>
			</view>
		</u-popup>
	</view>
</template>

<script>
	// #ifdef APP-PLUS
	const plug = uni.requireNativePlugin('UZK-Alibcsdk');
	const PPFace = uni.requireNativePlugin('PP-BaiduFace');
	// #endif
	import {
		mapState,
		mapMutations
	} from 'vuex'
	import helangCompress from '@/components/helang-compress/helang-compress';
	import MescrollMixin from "@/components/mescroll-uni/mescroll-mixins.js";
	import MescrollMoreItemMixin from "@/components/mescroll-uni/mixins/mescroll-more-item.js";
	import face from "@/util/js/face.js"
	export default {
		mixins: [MescrollMixin, MescrollMoreItemMixin], // 注意此处还需使用MescrollMoreItemMixin (必须写在MescrollMixin后面)
		components: {
			helangCompress
		},
		data() {
			return {
				user: {},
				topgrid: [{
						icon: require('../../static/image/index/pos.png'),
						url: 'nfc',
						title: '手机POS'
					},
					{
						icon: require('../../static/image/index/kjsk.png'),
						url: '../card/cardList?card_type=CC&source=gathering',
						title: '快捷收款'
					},
					{
						icon: require('../../static/image/index/huabei.png'),
						url: 'huabei',
						title: '花呗收款'
					},
					{
						icon: require('../../static/image/index/face.png'),
						url: 'pos',
						title: '刷脸收款'
					}
				],
				tablist: [{
					title: '精选',
					icon: ''
				}],
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
				tabsIndex: 0,
				subTabsIndex: 0,
				gridItemIndex: 0,
				opentbasIcon: false, //tabs弹窗
				page: 1,
				home_data: {
					list: []
				},
				choiceness: [],
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
				scrollerHeight: '400px',
				alertAnimation: {},
				alertTop: '', //弹窗距离顶部高度 
				status: 'loadmore', //加载更多
				firstLoad: true, //是否第一次加载
				goodsDetailsData: [],
				adCondition: '', //升序降序
				goodsClassId: '', //商品分类id
				autoplay: true,
				isloading: false,
				triggered: false,
				appkey: '', //百川appid
				alimm_client_id: '', //ali联盟id
				upOption: {
					noMoreSize: 5, // 配置列表的总数量要大于等于5条才显示'-- END --'的提示
					page: {
						size: 20 // 每页数据的数量
					},
					empty: {
						tip: '~ 搜索无数据 ~'
					},
					textNoMore: '没有更多了',
					auto: false,
				},
				downOption: {
					auto: false,
				},
				versionData: {},
				isSound: true, //默认是否开启语音提示（仅Android有效）默认值：false
				AutoClip: true, //自动裁剪用户脸部区域 默认：false
				backCamera: false, //启用后置摄像头
				logoSrcs: [],
				showFaceModel: false,
				showIdCardModel: false,
				apk_url: '',
				showNotice:false,	//显示公告
				noticeData:{}
			}
		},
		onLoad() {
			this.initData()
			// #ifdef APP-PLUS
			plug.init(result => {
				console.log(result)
			});
			// #endif
			this.height = uni.getSystemInfoSync().windowHeight + 'px'
			this.getNotice();
		},
		computed: { ...mapState(['forcedLogin', 'hasLogin', 'userInfo', 'isBindTaobao'])
		},
		onNavigationBarSearchInputClicked(e) {
			this.jump('search');
		},
		onNavigationBarButtonTap(e) {
			this.jump('../mine/service');
		},
		onShow() {

			// 初始化一个动画
			this.animation = uni.createAnimation({
				duration: 1000,
				timingFunction: 'linear',
			})
			let user = uni.getStorageSync('userInfo') || '';
			if (user.uid) {
				uni.getStorage({
					key: 'userInfo',
					success: (res) => {
						this.bindTaobao(res.data);
					}
				})
			}
		},
		onReady() {
			let that = this;
			uni.getSystemInfo({ //调用uni-app接口获取屏幕高度
				success(res) { //成功回调函数
					let height = res.windowHeight //windoHeight为窗口高度，主要使用的是这个
					let titleH = uni.createSelectorQuery().select(".head"); //想要获取高度的元素名（class/id）
					titleH.boundingClientRect(data => {
						that.scrollerHeight = height - data.height + 'px' //计算高度：元素高度=窗口高度-元素距离顶部的距离（data.top）
						that.alertTop = data.height;
					}).exec()

				}
			})
		},
		methods: {
			...mapMutations(['login']),
			async bindTaobao(provider) { //绑定淘宝账号
				let e = await this.http.request({
					api_source: 'shop',
					uri: '/api/auth/shop_login',
					method: 'POST',
					device: 'web',
					data: {
						uid: provider.uid,
						plat_flag: this.http.plat_flag
					}
				})
				if (e.data.status == 1) {
					if (e.data.body.tk_special_id) {
						provider.tk_special_id = e.data.body.tk_special_id;
					}
					this.user = provider;
					this.login(provider)
				} else {
					uni.showToast({
						title: e.data.info,
						icon: "none"
					})
				}
			},		
			async getNotice(){	//获取公告
				let res = await this.http.request({
					api_source: 'app',
					uri: '/Manage/update_app',
					method: 'POST',
					device: 'web',
					data: {
						type_app: 2
					}
				})
				if (res.data.status == 1) {
					this.noticeData = res.data.body.activity;
					console.log(this.noticeData)
					if(this.noticeData.param_url){
						this.showNotice = true;
					}
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
			},
			async getNfcApk() { //获取nfc apk下载链接
				let res = await this.http.request({
					api_source: 'app',
					uri: '/Manage/update_app',
					method: 'POST',
					device: 'web',
					data: {
						type_app: 4
					}
				})
				if (res.data.status == 1) {
					this.apk_url = res.data.body.url;
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
			},
			async update() { //更新版本
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
							uni.navigateTo({
								url: '../public/fullScreen'
							})
						}
					} else {
						uni.showToast({
							title: res.data.info,
							icon: "none"
						})
					}
				})
			},
			isLogin() { //是否登录
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
			async initData() { //初始化数据

				let res = await this.http.request({
					api_source: 'shop',
					uri: '/api/common/dictionaries_test',
					method: 'POST',
					device: 'web',
					data: {}
				})
				if (res.data.status == 1) {
					this.tablist = this.tablist.concat(res.data.body.goods_cate_data)
					this.appkey = res.data.body.alibaichuan.appKey;
					this.alimm_client_id = res.data.body.alimm_client_id;
					this.getHomeData();
					// #ifdef APP-PLUS
					this.update();
					// #endif
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}

			},
			async getHomeData() { //获取首页数据

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
				}).catch(() => {
					this.mescroll.endErr();
				})
				if (e.data.status == 1) {
					this.mescroll.endSuccess(e.data.body.list.length);
					if (this.page == 1) {
						this.home_data = e.data.body
						this.choiceness = [];
						for (var i in this.home_data.tqg_time_data) {
							if (this.home_data.tqg_time_data[i].state == 2) {
								this.startTime = this.home_data.tqg_time_data[i].q_time_all;
							}
						}
						this.getTqgData(this.startTime)
					}
					this.choiceness = this.choiceness.concat(e.data.body.list)
				} else {
					uni.showToast({
						title: e.data.info,
						icon: "none"
					})
				}
			},
			// 筛选商品
			async screenGoods(index, id, isFirst, gridItemIndex) {
				this.subTabsIndex = index;
				this.firstLoad = isFirst;
				this.gridItemIndex = gridItemIndex;
				if (isFirst) {
					this.goodsDetailsData = [];
				}

				let e = await this.http.request({
					api_source: 'shop',
					uri: '/api/shop_home/items',
					method: 'POST',
					device: 'web',
					data: {
						sort: this.subTabs[index].sort,
						page: this.page,
						page_size: 20,
						cat: id,
						plat_flag: this.http.plat_flag
					}
				})
				if (e.data.status == 1) {
					this.mescroll.endSuccess(e.data.body.list.length);
					if (this.page == 1) {
						this.goodsDetailsData = [];
					}
					this.goodsDetailsData = this.goodsDetailsData.concat(e.data.body.list)
				} else {
					uni.showToast({
						title: e.data.info,
						icon: "none"
					})
				}
			},
			async getTqgData(startTime) { //获取抢购数据

				let tqgdata = await this.http.request({
					api_source: 'shop',
					uri: '/api/shop_home/tqg',
					method: 'POST',
					device: 'web',
					data: {
						start_time: startTime,
						plat_flag: this.http.plat_flag
					}
				})
				if (tqgdata.data.status == 1) {
					this.tqgdata = tqgdata.data.body;
					this.mescroll.endSuccess(this.choiceness.length);
				} else {
					uni.showToast({
						title: tqgdata.data.info,
						icon: "none"
					})
				}
			},
			openTabasAlert() { //打开分类下拉弹窗
				this.opentbasIcon = !this.opentbasIcon
				if (this.opentbasIcon) {
					this.animation.height("auto").step()
				} else {
					this.animation.height(0).step()
				}
				this.alertAnimation = this.animation.export()
			},
			//切换分类
			changeNavbar(index) {
				this.tabsIndex = index;
				this.opentbasIcon = false;
				if (this.tabsIndex > 0) {
					this.goodsClassId = this.tablist[this.tabsIndex].children[0].value
				}
				this.mescroll.resetUpScroll();
				this.mescroll.scrollTo(0)
			},
			bannerClick(index) { //banner点击
				let url = this.home_data.advs[index].url
				this.openUrl(url);
			},
			//授权登录
			async loginTaobao() {
				let that = this;
				await plug.login(async result => {

					if (result.status) {
						await plug.qdByhide({
							url: `https://oauth.m.taobao.com/authorize?response_type=code&client_id=${this.alimm_client_id}&view=wap&custom=123&state=${this.userInfo.uid}_coll&redirect_uri=http://otshop.sspuzi.com/test/tb_login_callback`,
						}, async res => {
							let tbsq = await that.http.request({
								api_source: 'shop',
								uri: '/test/tb_login_callback_test',
								method: 'POST',
								device: 'web',
								data: {
									code: res.data.code,
									state: res.data.state
								}
							})
							console.log(res.data)
							if (tbsq.data.status == 1) {
								that.bindTaobao(that.user);
							} else {
								uni.showToast({
									title: tbsq.data.info,
									icon: "none"
								})
							}
						})
					}
				});
			},
			//查看商品详情
			lookDetails(item) {
				if (!this.hasLogin) {
					this.isLogin();
					return;
				}
				if (!this.isBindTaobao) {
					this.loginTaobao();
					return;
				}
				if (item.coupon_amount == 0) {
					this.openUrl(item.url)
				} else {
					uni.setStorageSync('item', JSON.stringify(item))
					uni.navigateTo({
						url: 'shopDetails?tqg=0&id=' + item.item_id + '&nick=' + item.nick + '&appkey=' + this.appkey
					})
				}
			},
			//打开外部链接
			openUrl(url) {
				if (!this.hasLogin) {
					this.isLogin();
					return;
				}
				if (!this.isBindTaobao) {
					this.loginTaobao();
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
			/*下拉刷新的回调 */
			downCallback() {
				this.mescroll.resetUpScroll();
			},
			/*上拉加载的回调: 其中page.num:当前页 从1开始, page.size:每页数据条数,默认10 */
			upCallback(page) {
				this.page = page.num;
				if (this.tabsIndex == 0) {
					this.getHomeData();
				} else {
					this.screenGoods(this.subTabsIndex, this.goodsClassId, false);
				}
			},

			tqgJump(id, url) { //抢购跳转
				if (!this.hasLogin) {
					this.isLogin();
					return;
				}
				if (!this.isBindTaobao) {
					this.loginTaobao();
					return;
				}
				if (this.tqgIndex == 2) {
					uni.navigateTo({
						url: 'shopDetails?tqg=1&id=' + id + '&url=' + encodeURIComponent(url) + '&appkey=' + this.appkey
					})
				} else if (this.tqgIndex < 2) {
					uni.showToast({
						title: '已过抢购时间',
						position: 'center',
						icon: 'none'
					})
				} else if (this.tqgIndex > 2) {
					uni.showToast({
						title: '未到抢购时间',
						position: 'center',
						icon: 'none'
					})
				}
			},
			tqgClick(index, startTime) { //抢购标题切换
				this.tqgIndex = index;
				if (this.tqgIndex < 2) {
					this.tqgBtnText = "已抢光"
					this.tqgBtnStyle.background = '#999'
				} else if (this.tqgIndex == 2) {
					this.tqgBtnText = "立即抢购"
					this.tqgBtnStyle.background = '#FFBA37'
				} else if (this.tqgIndex > 2) {
					this.tqgBtnText = this.home_data.tqg_time_data[index].q_time + "开抢"
					this.tqgBtnStyle.background = '#FF0000'
				}
				this.getTqgData(startTime)
			},
			jump(url) { //路由跳转
				let _self = this;
				if (!this.hasLogin) {
					this.isLogin();
					return;
				}
				if (this.userInfo.is_auditing != '2') {
					uni.navigateTo({
						url: '../public/security'
					});
					return;
				}
				switch (url) {
					case 'pos':
						if (_self.userInfo.face_token) {
							uni.navigateTo({
								url: '../card/cardList?card_type=CC&source=pos'
							})
						} else {
							this.showFaceModel = true;
						}
						break;
					case 'huabei':
						// this.$u.toast('即将开放，敬请期待')
						uni.navigateTo({
							url: '../gathering/gathering?source=huabei'
						})
						break;
					case 'nfc':
						this.getNfcApk();
						switch (uni.getSystemInfoSync().platform) {
							case 'android':
								if (_self.isSupportNfc()) {
									if (plus.runtime.isApplicationExist({
											pname: 'com.imaocn.goodnfc',
											action: ''
										})) {
										this.toNfc()
									} else {
										uni.showModal({
											content: '请下载nfc插件',
											success(res) {
												if (res.confirm) {
													_self.downloadNfcApk()
												}
											}
										})
									}
								}

								break;
							case 'ios':
								this.$u.toast('此功能不支持ios系统')
								break;
							default:
								break;
						}
						break;
					default:
						break;
				}
				uni.navigateTo({
					url: url
				})
			},
			downloadNfcApk() {
				let _self = this;
				uni.showLoading({
					title: ''
				})
				uni.downloadFile({ //执行下载
					url: _self.apk_url,
					success: downloadResult => { //下载成功
						uni.hideLoading();
						if (downloadResult.statusCode === 200) {
							plus.runtime.install( //安装
								downloadResult.tempFilePath, {
									force: true
								},
								function() {
									_self.toNfc()
								},
								function(e) {
									_self.$u.toast('安装失败')
								}
							);
						}
					},
					complete: () => {
						uni.hideLoading();
					}
				});
			},
			isSupportNfc() { //是否支持nfc功能
				let main = plus.android.runtimeMainActivity();
				let NfcAdapter = plus.android.importClass('android.nfc.NfcAdapter');
				let nfcAdapter = NfcAdapter.getDefaultAdapter(main);
				if (nfcAdapter == null) {
					uni.showToast({
						title: '该设备不支持NFC！',
						icon: 'none'
					})
					return false;
				}
				if (!nfcAdapter.isEnabled()) {
					uni.showToast({
						title: '请在系统设置中先启用NFC功能！',
						icon: 'none'
					});
					return false;
				} else {
					return true;
				}
			},
			toNfc() { //跳转nfc
				if (this.userInfo.hand_idcard) {
					uni.navigateTo({
						url: '../gathering/gathering?source=nfc'
					})
				} else {
					this.showIdCardModel = true;
				}
			},
			chooseImage() { //拍照
				let _self = this;
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					success(e) {
						const Max_size = 300 * 1024;
						if (e.tempFiles[0].size >= Max_size) {
							let qa = (Max_size / e.tempFiles[0].size).toFixed(2) * 100
							_self.$refs.helangCompress.compress({
								src: e.tempFilePaths[0],
								maxSize: 800,
								fileType: 'jpg',
								quality: qa
							}).then((res) => {
								_self.uploadImg(res)
							}).catch((err) => {
								console.log(err)
							});

						} else {
							_self.uploadImg(e.tempFilePaths[0])
						}
					},
					fail(e) {
						console.log(e)
					}
				})
			},
			async uploadImg(file) { //上传照片
				uni.showLoading({
					mask: true,
					title: ''
				})
				let res = await this.http.uploadFile({
					api_source: 'app',
					uri: '/Uploads/image',
					method: 'POST',
					device: 'web',
					data: {
						image: file,
					}
				})

				if (res.data.status == 1) {
					this.upladIdCard(res.data.body.pathurl)
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
			},
			async upladIdCard(file) { //上传身份证
				let res = await this.http.request({
					api_source: 'app',
					uri: '/Basic/up_hand_idcard',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
						hand_idcard: file
					}
				})
				uni.hideLoading()
				if (res.data.status == 1) {
					this.user = this.userInfo;
					this.user.hand_idcard = res.data.body.hand_cardid;
					this.login(this.user)
					this.$u.toast('上传成功');

				} else {
					uni.showToast({
						title: '上传失败',
						icon: "none"
					})
				}
			},
			inter(idx) { //人脸识别
				face.inter(idx);
			},
			lookNotice(){
				uni.navigateTo({
					url:'../public/webView?url='+encodeURIComponent(this.noticeData.param_url)
				})
			}
		}
	}
</script>

<style lang="scss">
	uni-swiper,
	swiper {
		height: 100%;
		width: 750rpx;
	}

	.head {
		position: sticky;
		top: 0;
		z-index: 999;
	}

	.tabs {
		background: #FFF;
		display: flex;
		justify-content: space-between;
		padding-bottom: 10rpx;
		height: 80rpx;
	}

	swiper-item {
		overflow: visible !important;
	}

	.tabs .u-tabs .u-tab-item,
	.tabs .u-tabs {
		height: 80rpx;
		line-height: 80rpx;
	}

	.tabas-panel-alert {
		right: 0;
		left: 0;
		bottom: 0;
		background: rgba($color: #000000, $alpha: 0.5);
		z-index: 999;
		overflow: scroll;
		-webkit-overflow-scrolling: auto;
	}

	.topbtn {
		background: linear-gradient(to right, #FFCF00, #FFBA00);

		.u-image {
			background-color: transparent;
		}

		.u-grid-item {
			background-color: transparent;
		}
	}

	.content {
		width: 750rpx;
	}

	.banner {
		padding: 0 20rpx;
		position: relative;
	}

	.banner:before {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		// border-radius: 0 0 20% 20%;
		background: linear-gradient(to right, #FFCF00, #FFBA00);
		height: 245rpx;
		top: 0;
		z-index: -2;
	}

	.banner:after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		border-radius: 20% 20% 0 0;
		background: #FFF;
		height: 100rpx;
		top: 150rpx;
		z-index: -1;
	}

	.active {
		background: #FFE177;
		padding-top: 20rpx;

		.item {
			width: 375rpx;
			margin-bottom: 20rpx;
		}
	}

	.tqg {
		padding: 0 20rpx;
		background: #FFF;

		.item {
			width: 100%;
			border-radius: 10px;
			text-align: center;
		}
	}

	.list-title {
		font-size: 36rpx;
		font-weight: bold;
		padding: 20rpx 0;
	}

	.tqg-list {
		padding: $padding-base;
		background: #FFF;
	}

	.tqg-list-item {
		display: flex;
		align-items: center;
		border-radius: 5rpx;
		padding: 25rpx;
		background: #FFFFFF;

		.tqg-list-item-info {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: flex-start;
			height: 260rpx;
			margin-left: 20rpx;
			flex: 1;

			.price {
				font-size: 42rpx;
				color: #FFBB00;
				font-weight: bold;
			}

			.price::before {
				content: "￥";
				font-size: 28rpx;
				color: #FFBB00;
			}

			.price:after {
				content: '折后';
				font-size: 24rpx;
				color: #FFBB00;
			}

			.s-price {
				color: #999;
				font-size: 28rpx;
				text-decoration: line-through;
			}

			.s-price:before {
				content: "原价";
				color: #999;
				font-size: 28rpx;
			}

			.bottom-row {
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: space-between;
				width: 100%;

				button:after {
					border: none;
				}
			}
		}
	}

	.tqg-list-item:not(:first-child) {
		border-top: 1px solid #F2F2F2;
	}

	.subClass {
		width: 100%;
		background: #FFFFFF;

	}

	.subTabs {
		margin-top: 20rpx;
		background: #FFFFFF;
		position: sticky;
		z-index: 99;
		top: 0;
	}

	.panel {
		background: #F2F2F2;
	}

	.goodsList {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		background: #F2F2F2;

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
					font-size: 28rpx;
					font-weight: 500;
					color: #FFBB00;
				}

				.price:after {
					content: '券后';
					font-size: 24rpx;
					color: #FFBB00;
					margin-left: 2px;
				}

				.s-price {
					color: #999;
					font-size: 24rpx;
					text-decoration: line-through;
				}

				.lineText {
					text-decoration: line-through;
				}
			}
		}
	}
</style>
