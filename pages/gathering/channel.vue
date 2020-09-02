<template>
	<view class="main white-bg">
		<u-gap height="20" bg-color="#F2F2F2"></u-gap>
		<view class="white-bg u-padding-30">
			<view class="u-padding-30 u-flex u-col-center white-bg channel u-margin-bottom-30" v-for="(item,index) in channel"
			 @click="bind(item)">
				<u-image width="75rpx" mode="widthFix" src="https://lmaopay.oss-cn-qingdao.aliyuncs.com/res/yTwoLevelList/290.png"></u-image>
				<view class="u-margin-left-30">
					<view class="u-flex u-row-between u-col-center">
						<text>{{item.channel_name}}</text>
						<text v-if="item.is_bind==0 && source!='huabei'" class="main-color">需绑卡验证</text></view>
					<view class="u-margin-top-10"><text class="u-font-24 u-type-info">{{item.rate_tip}}</text></view>
				</view>
			</view>
		</view>
		<u-action-sheet @click="stages" :tips="tips" :list="list" v-model="show"></u-action-sheet>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	export default {
		data() {
			return {
				card_info: {},
				channel: [],
				channel_item:{},
				source: '',
				tips: {
					text: "选择分期"
				},
				list: [{
						text: '不分期'
					},
					{
						text: '花呗分期数 X 6期'
					},
					{
						text: '花呗分期数 X 12期'
					}
				],
				stagesNum:'',
				show:false,
			};
		},
		onNavigationBarButtonTap(e) {
			uni.navigateTo({
				url:'../public/webView?url='+encodeURIComponent('https://h5.huitye.com/App/quotaTable.html?uid='+this.userInfo.uid)
			})
		},
		onLoad(parms) {
			this.card_info.card_id = parms.card_id
			this.source = parms.source;
			this.initData()
		},
		onShow() {
			this.channel = [];
			this.initData()
		},
		onPullDownRefresh() {
			this.initData();
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		methods: {
			async initData() {
				uni.showLoading({
					title: ''
				})
				let uri = '/PayBank/channel_list',
					data = {
						uid: this.userInfo.uid,
						card_id: this.card_info.card_id,
						channel_type: 'SK'
					}
				if (this.source == 'huabei') {
					uri = '/PayBank/tokio_list'
					data = {
						uid: this.userInfo.uid,
						card_id: this.card_info.card_id
					}
				}
				let res = await this.http.request({
					api_source: 'app',
					uri,
					method: 'POST',
					device: 'web',
					data
				})
				if (res.data.status == 1) {
					this.channel = []
					switch (this.source) {
						case 'pos':
							for (var i in res.data.body) {
								if (res.data.body[i].is_face == 1) {
									this.channel.push(res.data.body[i])
								}
							}
							break;
						case 'huabei':
							this.channel = res.data.body.card.tokio_channel_list
							break;
						default:
							this.channel = res.data.body
							break;
					}

				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
				uni.hideLoading()
				uni.stopPullDownRefresh();
			},
			async bind(item) {
				let pages = getCurrentPages(); //获取所有页面栈实例列表
				let prevPage = pages[pages.length - 2]; //上一页页面实例
				if (item.is_bind == 0 && this.source != 'huabei') {
					uni.showLoading({
						title: ''
					})
					let res = await this.http.request({
						api_source: 'app',
						uri: '/Channel/channel_registe',
						method: 'POST',
						device: 'web',
						data: {
							uid: this.userInfo.uid,
							card_id: this.card_info.card_id,
							channel_id: item.channel_id
						}
					})
					if (res.data.status == 1) {
						uni.navigateTo({
							url: '../public/webView?url=' + encodeURIComponent(res.data.body.info.bind_url)
						})
					} else {
						uni.showToast({
							title: res.data.info,
							icon: "none"
						})
					}
					uni.hideLoading()
					uni.stopPullDownRefresh();
					return;
				}
				if (this.source == 'gathering' || this.source == 'pos') {
					prevPage.$vm.formData.channel = item; //修改上一页面的 channel 参数值为 item
					uni.navigateBack()
				}
				if (this.source == 'huabei') {
					if(item.is_tokio == 2){
						this.channel_item = item;
						this.show == true
					}else{
						prevPage.$vm.formData.channel = item; //修改上一页面的 channel 参数值为 item
						uni.navigateBack()
					}
				}
			},
			stages(index){
				let pages = getCurrentPages(); //获取所有页面栈实例列表
				let prevPage = pages[pages.length - 2]; //上一页页面实例
				if(index == 0){
					this.stagesNum = ''
				}
				if(index == 1){
					this.stagesNum = 6
				}
				if(index == 2){
					this.stagesNum = 12
				}
			
				prevPage.$vm.formData.channel = this.channel_item; //修改上一页面的 channel 参数值为 item
				prevPage.$vm.stagesNum = this.stagesNum; 
				uni.navigateBack()
				this.show = false
			}
		}
	}
</script>

<style lang="scss">
	page {
		background: #FFF;
	}

	.channel {
		border-radius: 20rpx;
		box-shadow: 8px 2px 12px 0px rgba(189, 189, 189, 0.35), -8px 2px 12px 0px rgba(189, 189, 189, 0.35);
		height: 90rpx;
	}
</style>
