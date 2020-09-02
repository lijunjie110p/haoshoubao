<!-- 提现 -->
<template>
	<view class="main">
		<u-gap height="20" bg-color="#F2F2F2"></u-gap>
		<view class="white-bg u-padding-bottom-30">
			<u-cell-group :border="false">
				<u-cell-item :center="true" @click="showPopup=true">
					<u-icon v-if="type==1" class="u-margin-right-20" color="#00C800" name="weixin-fill" slot="icon" size="60"></u-icon>
					<u-image v-if="type==2" class="u-margin-right-20" width="70rpx" height="70rpx" shape="circle" :src="card_info.bank_icon"
					 slot="icon"></u-image>
					<view :custom-style="{fontSize:'30rpx',width:'400rpx'}" slot="title">
						<u-input :custom-style="{width:'400rpx'}" @click.native.stop="showPopup=true" :disabled="true" placeholder="请选择提现方式" v-model="title"></u-input>
					</view>
				</u-cell-item>
			</u-cell-group>
			<u-popup length="50%" v-model="showPopup" mode="bottom" :safe-area-inset-bottom="true" :closeable="true">
				<view class="popup-title u-text-center u-padding-20"><text class="font-blod u-font-32">选择提现方式</text></view>
				<u-line length="100%" color="#E6E6E6"></u-line>
				<u-cell-group :border="false">
					<u-cell-item @click="selectType(1)" :center="true" :arrow="false" title="提现至微信">
						<u-icon class="u-margin-right-20" color="#00C800" name="weixin-fill" slot="icon" size="60"></u-icon>
					</u-cell-item>
					<u-cell-item @click="selectType(2)" :center="true" :arrow="false" title="提现至银行卡">
						<u-image class="u-margin-right-20" width="60rpx" height="60rpx" slot="icon" src="https://lmaopay.oss-cn-qingdao.aliyuncs.com/res/yTwoLevelList/276.png"></u-image>
					</u-cell-item>
				</u-cell-group>
			</u-popup>
			<view class="u-margin-top-30 padding-width-base">
				<view class="u-font-30">提现金额</view>
				<view class="u-margin-top-20 u-flex "><text class="u-font-32 u-margin-right-10">￥</text>
					<u-input type="number" :custom-style="{fontSize:'80rpx',fontWeight:'bold'}" placeholder="0.00" v-model="money"></u-input>
				</view>
			</view>

		</view>
		<u-cell-group :title-style="{background:'#F6F6F6',padding:'30rpx'}" :title="'可提现金额￥'+amount" :border="false">

			<u-cell-item :center="true" :arrow="false">
				<u-input :custom-style="{fontSize:'30rpx'}" type="number" maxlength="6" v-model="code" placeholder="请输入验证码">
				</u-input>
				<u-button :custom-style="{background:'#FFF',color:'#FFBA00',fontSize:'24rpx',height:'60rpx',lineHeight:'60rpx'}"
				 slot="right-icon" @click="getCode">{{getText}}</u-button>
				<u-verification-code :seconds="seconds" ref="uCode" @change="codeChange"></u-verification-code>
			</u-cell-item>
		</u-cell-group>
		<view class="u-padding-30 u-flex u-col-center">
			<u-icon name="error-circle-fill" color="#FFBB00" size="40"></u-icon>
			<text class="u-line-2 u-font-24 u-type-info u-margin-left-10">提现至银行卡将额外收取3.00元/笔手续费，提现至微信零钱将额外收取2.00元/笔手续费</text>
		</view>
		<view class="subbtn">
			<u-button @click="withdraw" :hair-line="false" :custom-style="btnStyle">提现</u-button>
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
				tabsIndex: 0,
				seconds: 60,
				type: 0,
				title: '',
				card_info: {},
				money: '', //转账金额
				code: '',
				amount: '', //余额
				getText: '获取验证码',
				btnStyle: {
					background: 'linear-gradient(270deg,rgba(255,186,0,1),rgba(255,207,0,1))',
					height: '90rpx',
					color: '#FFF',
					border: 'none',
					fontSize: '36rpx'
				},
				showPopup: false,
				wxconfig:{},
			};
		},
		computed: {
			...mapState(['hasLogin', 'userInfo', 'sonInfo'])
		},
		onLoad(parms) {
			this.ruid = parms.ruid
			this.initData();
		},
		methods: {
			selectType(type) {
				let _self = this;
				
				switch (type) {
					case 1:
						uni.login({
							provider:'weixin',
							success(res) {
								_self.wxconfig = res;
								uni.getUserInfo({
									provider:'weixin',
									success(infoRes){
										_self.type = type
										_self.title = `提现至微信 (${infoRes.userInfo.nickName})`
									}
								})
							}
						})
						break;
					case 2:
						uni.navigateTo({
							url: '../card/cardList?card_type=DC&source=withdraw'
						})
						break;
					default:
						break;
				}
				this.code = "";
				this.showPopup = false;
			},
			async initData() {
				if (this.ruid) {
					this.son_info = this.sonInfo;
					if (!this.son_info.realname) {
						this.son_info.realname = " "
					}
				}

				let res = await this.http.request({
					api_source: 'app',
					uri: '/Member/wallet',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid
					}
				})
				if (res.data.status == 1) {
					this.amount = res.data.body.amount
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
			},
			codeChange(text) {
				this.getText = text;
			},
			async getCode() {
				if (this.$refs.uCode.canGetCode) {
					uni.showLoading({
						title: '正在获取验证码'
					})
					let res = await this.http.request({
						api_source: 'app',
						uri: '/Basic/verification',
						method: 'POST',
						device: 'web',
						data: {
							mobile: this.userInfo.mobile,
							module: 'accounts'
						}
					})
					uni.hideLoading();
					if (res.data.status == 1) {
						console.log(res.data.body)
						this.$u.toast('验证码已发送');
						this.$refs.uCode.start();
					} else {
						uni.showToast({
							title: res.data.info,
							icon: "none"
						})
					}
				} else {
					this.$u.toast('倒计时结束后再发送');
				}
			},
			async withdraw() {
				if (!this.type) {
					this.$u.toast('请选择入账方式')
					return
				}
				if (!this.money) {
					this.$u.toast('请输入提现金额')
					return
				}
				if (!this.code) {
					this.$u.toast('请输入验证码')
					return
				}
				let res = await this.http.request({
					api_source: 'app',
					uri: '/Member/accounts',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
						wallet_mode: 'wallet',
						amount: this.money,
						type: this.type,
						verify: this.code,
						card_id: this.card_info.card_id,
						openid:this.wxconfig.authResult.openid
					}
				})
				if (res.data.status == 1) {
					this.$u.toast('提现成功')
					this.initData();
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
	.tabs {
		background: #F6F6F6;
		padding: 0 30rpx;
	}


	.subbtn {
		margin: 50rpx 30rpx;
		padding-bottom: 50rpx;
	}
</style>
