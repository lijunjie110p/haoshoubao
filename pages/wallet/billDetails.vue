<template>
	<view class="main">
		<view class="info u-flex u-flex-col u-row-center u-col-center">
			<u-icon color="#FFCB00" size="100" name="rmb-circle-fill"></u-icon>
			<view class="u-margin-30 u-font-32"><text>订单金额</text></view>
			<view class="price">
				<text v-if="source=='performance'">￥</text>
				<text><text v-if="data.act_type=='out' && source!='performance'">-</text><text v-if="data.act_type!='out' && source!='performance'">+</text>{{data.amount}}</text></view>
		</view>
		<view class="u-padding-30">
			<u-cell-group>
				<u-cell-item title="当前状态" :value="source=='performance'?data.trade_state:data.state" :center="true" :arrow="false"
				 :title-style="{color:'#030400',fontSize:'28rpx'}" :value-style="{fontSize:'28rpx',color:'#030400'}"></u-cell-item>
				<u-cell-item title="交易对象" :value="source=='performance'?data.name:data.transaction_mode" :center="true" :arrow="false"
				 :title-style="{color:'#030400',fontSize:'28rpx'}" :value-style="{fontSize:'28rpx',color:'#030400'}"></u-cell-item>
				<u-cell-item title="交易方式" :value="source=='performance'?data.trade_mode:data.transaction_object" :center="true"
				 :arrow="false" :title-style="{color:'#030400',fontSize:'28rpx'}" :value-style="{fontSize:'28rpx',color:'#030400'}"></u-cell-item>
				<u-cell-item title="交易时间" :value="source=='performance'?$u.timeFormat(data.trade_time, 'yyyy-mm-dd hh:MM:ss'):data.time"
				 :center="true" :arrow="false" :title-style="{color:'#030400',fontSize:'28rpx'}" :value-style="{fontSize:'28rpx',color:'#030400'}"></u-cell-item>
				<u-cell-item title="订单号" :value="source=='performance'?data.order_no:data.orderid" :center="true" :arrow="false"
				 :title-style="{color:'#030400',fontSize:'28rpx'}" :value-style="{fontSize:'28rpx',color:'#030400'}"></u-cell-item>
			</u-cell-group>
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
				record_id: '',
				data: {},
				source: ''
			};
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		onLoad(parms) {
			this.source = parms.source
			switch (parms.source) {
				case 'bill':
					this.record_id = parms.record_id
					uni.setNavigationBarTitle({
						title: '账单详情'
					});
					break;
				case 'performance':
					this.record_id = parms.id
					uni.setNavigationBarTitle({
						title: '业绩详情'
					});
					break;
				default:
					break;
			}
			this.initData();
		},
		methods: {
			async initData() {
				let url = '',
					data = '';
				if (this.source == 'bill') {
					url = '/Member/bill_info'
					data = {
						record_id: this.record_id
					}
				} else if (this.source == 'performance') {
					data = {
						uid: this.userInfo.uid,
						id: this.record_id
					}
					url = '/Benefit/trade_info'
				}
				let res = await this.http.request({
					api_source: 'app',
					uri: url,
					method: 'POST',
					device: 'web',
					data: data
				})
				if (res.data.status == 1) {
					this.data = res.data.body
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
			},
		}
	}
</script>

<style lang="scss">
	.info {
		height: 400rpx;
		background: #FFF;

		.price {
			font-size: 55rpx;
			font-weight: bold;
			color: #030400;
		}
	}
</style>
