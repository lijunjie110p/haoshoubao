<template>
	<view class="main">
		<u-cell-group :border="false">
			<u-cell-item @click="back(item.bank_id,item.bank_name)" :arrow="false" v-for="(item,index) in bankList" :key="index" :title="item.bank_name">
				<u-image :src="item.bank_icon" class="u-margin-right-20" width="50rpx" height="50rpx" shape="circle" slot="icon"></u-image>
			</u-cell-item>
		</u-cell-group>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	export default {
		data() {
			return {
				bankList: ''
			};
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		onLoad() {
			this.getBankList()
		},
		methods: {
			async getBankList() {
				uni.showLoading({
					mask: true,
					title: ''
				})
				let res = await this.http.request({
					api_source: 'app',
					uri: '/PayBank/bank_list',
					method: 'POST',
					device: 'web',
					data: {}
				})
				if (res.data.status == 1) {
					this.bankList = res.data.body
				}else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
				uni.hideLoading()
			},
			back(id,name) {
				let pages = getCurrentPages(); //获取所有页面栈实例列表
				let prevPage = pages[pages.length - 2]; //上一页页面实例
				prevPage.$vm.bank_id = id; //修改上一页面的 couponNumber 参数值为 value
				prevPage.$vm.forminfo.bank_name = name; 
				uni.navigateBack()
			}
		}
	}
</script>

<style lang="scss">

</style>
