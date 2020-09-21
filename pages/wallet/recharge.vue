<template>
	<view class="main">
		<u-gap height="20" bg-color="#F2F2F2"></u-gap>
		<u-cell-group :border="false">
			<u-cell-item :arrow="false" :title-style="{fontSize:'32rpx',marginLeft:'30rpx'}" :center="true" title="微信支付">
				<u-icon color="#00C800" name="weixin-fill" slot="icon" size="60"></u-icon>
			</u-cell-item>
		</u-cell-group>
		<view class="u-margin-top-30 u-padding-30">
			<view class="u-font-30">充值金额</view>
			<view class="u-margin-top-20 u-flex "><text class="u-font-32 u-margin-right-10">￥</text>
				<u-input type="number" :custom-style="{fontSize:'80rpx',fontWeight:'bold'}" placeholder="0.00" v-model="money"></u-input>
			</view>
		</view>
		<u-line length="100%" color="#E8E8E8"></u-line>
		<view class="subbtn">
			<u-button @click="recharge" :hair-line="false" :custom-style="btnStyle">充值</u-button>
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
				money: '',
				btnStyle: {
					background: 'linear-gradient(270deg,rgba(255,186,0,1),rgba(255,207,0,1))',
					height: '90rpx',
					color: '#FFF',
					border: 'none',
					fontSize: '36rpx'
				},
			};
		},
		computed: {
			...mapState(['hasLogin', 'userInfo', 'sonInfo'])
		},
		methods: {
			async recharge() {
				let uView = this.$u;
				if (this.money == '') {
					this.$u.toast('请输入充值金额')
					return;
				}
				uni.showLoading({
					title: ''
				})
				let res = await this.http.request({
					api_source: 'app',
					uri: '/Member/recharge',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
						amount: this.money,
						mode: 'wx'
					}
				})
				uni.hideLoading();
				console.log(res)
				if (res.data.status == 1) {
					uni.requestPayment({
						provider: 'wxpay',
						orderInfo:res.data.body, 
						success: function(res) {
							uView.toast('充值成功')
						}, 
						fail: function(err) {
							uView.toast('支付失败')
						}
					}) 
					
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
			}
		}
	}
</script>

<style lang="scss">
	.subbtn {
		margin: 50rpx 30rpx;
		padding-bottom: 50rpx;
	}
</style>
