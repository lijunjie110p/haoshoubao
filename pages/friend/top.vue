<template>
	<view class="main">
		<view class="bg">
			<u-image src="https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-08-05/5f2a617b20992.png" mode="widthFix"></u-image>
		</view>
		<view class="top">
			<view class="content">
				<u-tabs :is-scroll="false"  ref="uTabs"  bar-width="100" inactive-color="#999" bar-height="6" bg-color="#FFF" height="100" name="title"
				 duration="0.3" active-color="#FFBA37" :list="tablist" :current="tabsIndex" @change="changeNavbar"></u-tabs>
			</view>
			<view class="list">
				<u-cell-group >
					<u-cell-item @click="details(item.uid)" :center="true" :key="index" :arrow="false" :title-style="{marginLeft:'20rpx',fontSize:'32rpx'}"  v-for="(item,index) in list">
						<view slot="icon">
							<u-image :src="noimg[index]" width="55" height="55" v-if="index<3"></u-image>
							<view v-else class="num"><text>{{index+1}}</text></view>
						</view> 
						<view class="u-flex u-col-center" slot="title">
							<u-avatar :src="item.avatar" size="65" ></u-avatar>
							<text class="u-margin-left-20 u-main-color">{{item.realname}}</text>
						</view>
						<view slot="right-icon">
							<text class="u-font-32"  v-if="mode==1">{{item.invite_count}}名用户</text>
							<text class="u-font-32" v-if="mode==2">{{item.team_count}}元</text>
						
						</view>
					</u-cell-item>
				</u-cell-group>
			</view>
		</view>
		<u-loadmore font-size="30" margin-top="20" :load-text="{loadmore:'点击或上拉加载更多',loading: '努力加载中',nomore:'没有更多了'}"
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
				mode: 1,
				page: 1,
				tabsIndex: 0,
				tablist: [{
						title: '按用户数',
						icon: '',
					},
					{
						title: '按交易量',
						icon: ''
					}
				],
				list:[],
				noimg:[
					'https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-08-05/5f2a6a52c49e0.png',
					'https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-08-05/5f2a6a7d25e42.png',
					'https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-08-05/5f2a6a8a550a5.png'
				],
				status: 'loadmore'
			};
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		onLoad() {
			this.initData()
		},
		onPullDownRefresh() {
			this.list = [];
			this.page = 1;
			this.initData()
		},
		onReachBottom() {
			if (this.status == 'loadmore') {
				this.onreachBottom()
			}
		},
		methods: {
			changeNavbar(index) {
				this.tabsIndex = index;
				this.mode = index+1;
				this.page = 1;
				this.list = [];
				this.initData();
			},
			onreachBottom() {
				this.page++
				this.initData();
			},
			async initData() {
				this.status = 'loading'
				let res = await this.http.request({
					api_source: 'app',
					uri: '/User/friend_rank',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
						page: this.page,
						sort: this.mode,
					}
				})
				if (res.data.status == 1) {
					this.list = this.list.concat(res.data.body.friend_list);
					if (res.data.body.friend_list.length == 0) {
						this.status = 'nomore'
					} else {
						this.status = 'loadmore'
					}
				}else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
				uni.stopPullDownRefresh()
			},
			details(sid){
				if(this.userInfo.uid == sid){
					this.$u.toast('不能选择自己')
					return;
				}
				uni.navigateTo({
					url: 'details?sonid='+sid
				})
			}
		}
	}   
</script>

<style lang="scss">
	.main{
		.bg{
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			z-index: -1;
		}
		.top{
			padding-top: 370rpx;
			.content{
				border-radius: 40rpx 40rpx 0 0;
				background: #FFFFFF;
				overflow: hidden;
			}
			.list {
				.num{
					width: 56rpx;
					font-size: 42rpx;
					color: #cbcbcb;
					font-weight: bold;
					text-align: center;
				}
			}
		}
		
	}
</style>
