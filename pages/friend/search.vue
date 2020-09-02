<template>
	<view class="main">

		<view class="friendList">
			<view class="list">
				<u-cell-group :border="false">
					<u-cell-item @click="back(item)" :key="index" :arrow="false" :title-style="{marginLeft:'20rpx',fontSize:'32rpx'}"
					 :title="item.realname" :label="item.group_name" v-for="(item,index) in list">
						<u-avatar :src="item.avatar" size="120" slot="icon"></u-avatar>
						<view slot="right-icon"><text class="u-font-32">已邀请{{item.sort_count}}人</text></view>
					</u-cell-item>
				</u-cell-group>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	export default {
		data() {
			return {
				condition: '',
				list:''
			};
		},
		onReachBottom() {

		},
		onLoad() {
			// this.searchFriend()
		},
		onNavigationBarButtonTap(e){
			if(e.index == 0){
				this.searchFriend()
			}
		},
		onNavigationBarSearchInputConfirmed(e) {
			this.condition = e.text;
			this.searchFriend()
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		methods: {

			async searchFriend() {
				uni.showLoading({
					title: '正在搜索'
				})
				let res = await this.http.request({
					api_source: 'app',
					uri: '/User/user_friend_list',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
						realname:this.condition
					}
				})
				uni.hideLoading();
				if (res.data.status == 1) {
					this.list =res.data.body.friend_list;
					if(this.list.length == 0){
						this.$u.toast('没有搜索到此好友...')
					}
				}else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
			},
			back(item){
				let pages = getCurrentPages(); //获取所有页面栈实例列表
				let prevPage = pages[pages.length - 2]; //上一页页面实例
				prevPage.$vm.son_info = item; //修改上一页面的 couponNumber 参数值为 value
				prevPage.$vm.ruid = item.uid;
				uni.navigateBack()
			}
		}
	}
</script>

<style lang="scss">
	.list {
		padding: 0 30rpx;

		.u-cell_title {
			display: flex;
			flex-direction: column;
			justify-content: center;
		}
	}
</style>
