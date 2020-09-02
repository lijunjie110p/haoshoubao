<template>
	<view class="main">
		<view class="form">
			<u-form :error-type="['toast']" :model="formData" ref="uForm">
				<u-form-item :left-icon-style="{color:'#999',fontSize:'36rpx'}" left-icon="rmb-circle" label-width="200" label="收款金额"
				 prop="money">
					<u-input type="number" :custom-style="{fontSize:'60rpx',fontWeight:'bold'}" v-model="formData.money" placeholder="0.00">
					</u-input>
				</u-form-item>
				<u-form-item :left-icon-style="{color:'#999',fontSize:'36rpx',width:'36rpx',height:'auto'}" left-icon="https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-08-09/5f2fb05dbe280.png"
				 label-width="200" label="收款城市" prop="region">
					<u-input type="select" v-model="formData.region" @click="showRegion = true" placeholder=""> </u-input>
					<u-picker confirm-color="#FFBA37" :safe-area-inset-bottom="true" @confirm="selectedRegion" mode='region'
					 :default-region="area" v-model="showRegion"></u-picker>
				</u-form-item>
				<u-form-item v-if="source!='nfc'" left-icon="https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-08-09/5f2fb0731cfee.png"
				 :left-icon-style="{color:'#999',fontSize:'36rpx',width:'36rpx',height:'auto'}" label-width="200" label="选择通道" prop="channel.channel_id">
					<u-input @click="jump('channel?source='+source+'&card_id='+card_id)" type="select" v-model="formData.channel.channel_name"
					 placeholder="请选择通道"> </u-input>
				</u-form-item>
				<u-form-item :left-icon="formData.cashCard.bank_icon" :left-icon-style="{color:'#999',fontSize:'36rpx',width:'36rpx',height:'auto'}"
				 label-width="400" :label="title" prop="cashCard">
					<u-input type="text" disabled placeholder=""> </u-input>
					<u-button @click="jump('../card/cardList?card_type=DC&source=gathering&dcindex='+dcindex)" shape="circle"
					 :custom-style="{background:'#FFBA00',color:'#FFF',fontSize:'24rpx',height:'60rpx',lineHeight:'60rpx'}" slot="right">更换</u-button>
				</u-form-item>
				<u-form-item v-if="formData.channel.is_sms==1" :left-icon-style="{color:'#999',fontSize:'40rpx'}" left-icon="email"
				 label-width="100" prop="code">
					<u-input type="number" maxlength="6" v-model="formData.code" placeholder="请输入验证码"> </u-input>
					<u-button shape="circle" :custom-style="{background:'#FFBA00',color:'#FFF',fontSize:'24rpx',height:'60rpx',lineHeight:'60rpx'}"
					 slot="right" @click="testCode">{{getText}}</u-button>
					<u-verification-code :seconds="seconds" ref="uCode" @change="codeChange"></u-verification-code>
				</u-form-item>
			</u-form>

		</view>
		<view class="subbtn">
			<u-button @click="testForm" :hair-line="false" :custom-style="btnStyle">确认收款</u-button>
		</view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	import face from "@/util/js/face.js"
	export default {
		data() {
			return {
				card_id: '', //信用卡id
				title: '入账银行卡',
				formData: {
					money: '',
					region: '',
					channel: {
						is_sms: 0
					}, //通道
					cashCard: { //储蓄卡
						bank_icon: 'list'
					},
					code: ''
				},
				area: [],
				rules: {
					money: [{
						required: true,
						message: '请输入金额',
						trigger: 'blur'
					}],
					channel: [{
						required: true,
						message: '请选择通道',
						trigger: 'blur'
					}],
					region: [{
						required: true,
						message: '请选择地区',
						trigger: 'blur'
					}],
					cbank: [{
						required: true,
						message: '请选择入账银行卡',
						trigger: 'blur'
					}]

				},
				btnStyle: {
					background: '#FFF',
					height: '90rpx',
					color: '#333',
					border: 'none'
				},
				getText: '获取验证码',
				showRegion: false,
				seconds: 60,
				codeinfo: {}, //短信返回信息
				dcindex: 0,
				source: '',
				stagesNum: '', // 分期数
				longitude_latitude: '' //经纬度
			};
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		onLoad(parms) {
			this.card_id = parms.card_id;
			this.source = parms.source;
			let _self = this;
			uni.getLocation({
				geocode: true,
				success(res) {
					_self.formData.region = res.address.province + '-' + res.address.city
					_self.longitude_latitude = res.latitude + ',' + res.longitude
				}
			})
			this.getCashCard()
		},
		onShow() {
			switch (this.source) {
				case 'pos':
					uni.setNavigationBarTitle({
						title: '刷脸收款'
					})
					break;
				case 'huabei':
					uni.setNavigationBarTitle({
						title: '花呗收款'
					})
					break;
				case 'nfc':
					uni.setNavigationBarTitle({
						title: '手机pos'
					})
					break;
				default:
					break;
			}
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		onNavigationBarButtonTap(e) {
			if (e.index == 0) {
				uni.navigateTo({
					url: 'record'
				})
			}
		},
		methods: {
			async getCashCard() {
				let res = await this.http.request({
					api_source: 'app',
					uri: '/PayBank/card_holder',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
						card_type: "DC"
					}
				})
				if (res.data.status == 1) {
					this.dcindex = 0;
					this.formData.cashCard = res.data.body.card[0]
					this.title = this.formData.cashCard.bank_name + '     尾号' + this.formData.cashCard.card_no.substr(this.formData.cashCard
						.card_no.length - 4, this.formData.cashCard.card_no.length)
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
			},
			testForm() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						this.gethering()
					} else {
						return;
					}
				});
			},
			testCode() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						this.getCode()
					} else {
						return;
					}
				});
			},
			jump(url) {
				if (this.source == 'huabei') {
					url = 'channel?source=' + this.source + '&card_id=' + this.formData.cashCard.card_id
				}
				uni.navigateTo({
					url: url
				})
			},
			codeChange(text) {
				this.getText = text;
			},
			selectedRegion(e) {
				this.formData.region = `${e.province.label}-${e.city.label}`
			},
			async getCode() {
				if (!this.formData.channel.channel_id && this.source != 'nfc') {
					this.$u.toast('请选择通道')
					return;
				}
				if (!this.formData.cashCard.card_id) {
					this.$u.toast('请选择入账银行卡')
					return;
				}
				if (this.$refs.uCode.canGetCode) {
					uni.showLoading({
						title: '正在获取验证码'
					})
					let res = await this.http.request({
						api_source: 'app',
						uri: '/Channel/send_consume_request',
						method: 'POST',
						device: 'web',
						data: {
							uid: this.userInfo.uid,
							card_id: this.card_id,
							channel_id: this.formData.channel.channel_id,
							rate_id: this.formData.channel.rate_id,
							amount: this.formData.money,
							save_id: this.formData.cashCard.card_id,
						}
					})
					uni.hideLoading();
					if (res.data.status == 1) {
						console.log(res.data.body)
						this.codeinfo = res.data.body.info;
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
			gethering() {
				let _self = this;
				if (!this.formData.channel.channel_id && this.source != 'nfc') {
					this.$u.toast('请选择通道')
					return;
				}
				if (!this.formData.cashCard.card_id) {
					this.$u.toast('请选择入账银行卡')
					return;
				}
				if (this.formData.channel.is_sms == 1 && this.codeinfo == '') {
					this.$u.toast('请获取验证码')
					return;
				}
				switch (this.source) {
					case 'pos':
						face.contrastSuccess = function() {
							_self.collection();
						}
						face.inter(1)
						break;
					case 'gathering':
						this.collection();
						break;
					case 'huabei':
						this.collection();
						break;
					case 'nfc':
						this.registeChannel();
						break;
					default:
						break;
				}
			},
			async registeChannel() {
				let res = await this.http.request({
					api_source: 'app',
					uri: '/Channel/channel_registe',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
						device_location: this.longitude_latitude,
						channel_id: 54
					}
				})
				if (res.data.status == 1) {
					this.collection();
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
			},
			async collection() {
				let _self = this;
				uni.showLoading({
					title: ''
				})
				let data = {
					uid: this.userInfo.uid,
					thpinfo: this.codeinfo.thpinfo,
					trxid: this.codeinfo.trxid,
					verify: this.formData.code,
					channel_id: this.formData.channel.channel_id,
					pay_cardid: this.card_id,
					reach_cardid: this.formData.cashCard.card_id,
					money: this.formData.money,
					city: this.formData.region,
					rate_id: this.formData.channel.rate_id,
					device_location: this.longitude_latitude
				}
				if (this.source == 'huabei') {
					data.pay_mode = '3';
					data.stagesNum = this.stagesNum
				}
				if (this.source == 'nfc') {
					data.pay_mode = '4';
				}
				let res = await this.http.request({
					api_source: 'app',
					uri: '/Trade/trade_draw',
					method: 'POST',
					device: 'web',
					data
				})
				uni.hideLoading();
				if (res.data.status == 1) {
					if (this.source == 'huabei') {
						plus.runtime.openURL(res.data.body.url, function(e) {
							uni.showModal({
								content: "本机未检测到支付宝客户端",
							})
						});
					} else if (this.source == 'nfc') {
						plus.runtime.launchApplication({
								pname: "com.imaocn.goodnfc",
								action: "com.imaocn.goodnfc.activity.MainActivity",
								extra: {
									uni_data: JSON.stringify(res.data.body)
								}
							},
							function(e) {
								console.log(e.message)
							});
					} else {
						if (res.data.body.url) {
							uni.navigateTo({
								url: '../public/webView?url=' + encodeURIComponent(res.data.body.url)
							})
						} else {
							this.$u.toast('收款成功')
							uni.navigateTo({
								url: 'record'
							})
						}
					}


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
	page {
		background: linear-gradient(270deg, rgba(254, 143, 0, 1), rgba(253, 169, 38, 1));
	}

	.bg {}

	.form {
		width: 600rpx;
		border-radius: 25rpx;
		background: #FFF;
		position: relative;
		margin: 150rpx auto 100rpx auto;
		padding: 30rpx;

		.u-form-item--left__content__icon {
			line-height: 1;
		}
	}

	.form::before {
		content: '';
		position: absolute;
		height: 25rpx;
		top: -25rpx;
		border-radius: 25rpx 25rpx 0 0;
		background: #FFF;
	}

	.form:before {
		content: '';
		position: absolute;
		height: 25rpx;
		left: 50rpx;
		right: 50rpx;
		top: -25rpx;
		border-radius: 25rpx 25rpx 0 0;
		background: #FFBF64;
	}

	.form:after {
		content: '';
		position: absolute;
		height: 25rpx;
		left: 50rpx;
		right: 50rpx;
		bottom: -25rpx;
		border-radius: 0 0 25rpx 25rpx;
		background: #FFBF64;
	}

	.subbtn {
		margin: 50rpx 70rpx;
		padding-bottom: 50rpx;
	}
</style>
