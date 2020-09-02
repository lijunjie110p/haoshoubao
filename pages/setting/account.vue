<template>
	<view class="main">
		<u-swipe-action :show="item.show" :index="index" @click="delUser" v-for="(item,index) in data" :key="index" @open="open"
		 :options="options" @close="close">
			<view @click="switchLogin(index)" class="u-flex u-row-between u-col-center u-padding-30 u-border-bottom">
				<u-image shape="circle" width="70rpx" height="70rpx" :src="item.avatar"></u-image>
				<view class="u-margin-left-20 u-flex-1 u-text-left">
					<view>{{item.realname}}</view>
					<view>{{item.mobile}}</view>
				</view>
				<u-icon v-if="item.uid==user.uid" color="#030400" name="checkbox-mark"></u-icon>
			</view>
		</u-swipe-action>
		<u-cell-group>
			<u-cell-item @click="add" :arrow="false" :title-style="{fontSize:'30rpx',height:'90rpx',lineHeight:'90rpx',marginLeft:'30rpx'}"
			 :center="true" title="添加新账号">
				<u-icon slot="icon" name="plus-circle" size="50"></u-icon>
			</u-cell-item>
		</u-cell-group>

	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	export default {
		computed: {
			...mapState(['hasLogin', 'userInfo', 'userInfos'])
		},
		data() {
			return {
				data: [],
				user: {},
				options: [{
					text: '删除',
					style: {
						backgroundColor: '#dd524d'
					}
				}]
			};
		},
		onLoad() {
			this.initData()
		},
		methods: {
			...mapMutations(['login', 'deleteUser','logout']),
			initData() {
				this.user = this.userInfo
				this.data = this.userInfos
				for (var i in this.data) {
					this.data[i].show = false;
				}
			},
			async switchLogin(index){
				if(this.userInfos[index].uid!=this.userInfo.uid){
					let res = await this.http.request({
						api_source: 'app',
						uri: '/Member/myinfo',
						method: 'POST',
						device: 'web',
						data: {
							uid:this.userInfos[index].uid,
						}
					})
					if (res.data.status == 1) {
						this.login(res.data.body.userinfo);
						uni.switchTab({
							url: '../index/index'
						})
					} else {
						uni.showToast({
							title: res.data.info,
							icon: "none"
						})
					}
					
				}
				
			},
			delUser(index, index1) {
				let that = this;
				if (index1 == 0) {
					uni.showModal({
						content: '确定删除该账号?',
						success(e) {
							if (e.confirm) {
								if(that.data[index].uid == that.userInfo.uid){
									that.logout()
									plus.runtime.restart();
								}
								that.data.splice(index, 1);
								that.deleteUser(index);
								
							}

						}
					})

				}
			},
			add() {
				uni.navigateTo({
					url: '../public/addAccount?type=add'
				})
			},
			open(index) {
				this.data[index].show = true;
				this.data.map((val, idx) => {
					if (index != idx) this.data[idx].show = false;
				})
			},
			close(index) {
				this.data[index].show = false;
			}
		}
	}
</script>

<style lang="scss">

</style>
