<template>
	<view class="main">
		<view class="form">

			<u-form :error-type="['toast']" :model="forminfo" ref="uForm">
				<u-form-item label-width="0" label=" " :border-bottom="false" prop="card_pic">
					<view class="u-flex-1">
						<view class="slot-btn" @click="chooseImg">
							<u-image @click="chooseImg" v-if="forminfo.card_pic==''" width="75rpx" height="75rpx" src="https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-08-04/5f2951f3524e0.png"></u-image>
							<view v-if="forminfo.card_pic==''" class="text"><text>请上传储蓄卡正面照片</text></view>
							<u-image @click="chooseImg" v-if="forminfo.card_pic!=''" width="100%" mode="widthFix" :src="bankimg"></u-image>
						</view>
						<view class="tips">
							<view class="u-font-24 u-content-color u-line-1"><text>1.保证照片清晰</text></view>
							<view class="u-font-24 u-content-color u-line-1"><text>2.必须是本人的储蓄卡</text> </view>
							<view class="u-font-24 u-content-color u-line-1"><text>3.请仔细核对卡号是否一致</text></view>
						</view>
					</view>
				</u-form-item>
				<u-form-item label-width="150" label="储蓄卡号" prop="bank_number">
					<u-input type="number" v-model="forminfo.bank_number" placeholder="请输入储蓄卡号"> </u-input>
				</u-form-item>
				<u-form-item label-width="150" label="开户银行" prop="bank_name">
					<u-input type="select" @click="showBankList" v-model="forminfo.bank_name" placeholder="请选择开户银行"> </u-input>
				</u-form-item>
				<u-form-item label-width="150" label="预留手机号" prop="mobile">
					<u-input type="number" v-model="forminfo.mobile" placeholder="请输入银行预留手机号"> </u-input>
				</u-form-item>
				<u-form-item :border-bottom="false" label-width="150" label="验证码" prop="code">
					<u-input type="number" maxlength="6" v-model="forminfo.code" placeholder="请填写验证码"> </u-input>
					<u-button :custom-style="{background:'#FFBA00',color:'#FFF',fontSize:'24rpx',height:'60rpx',lineHeight:'60rpx'}"
					 slot="right" @click="getCode">{{getText}}</u-button>
					<u-verification-code :seconds="seconds" ref="uCode" @change="codeChange"></u-verification-code>
				</u-form-item>
			</u-form>
		</view>
		<view class="subbtn">
			<u-button @click="addCard" :hair-line="false" :custom-style="btnStyle">添加</u-button>
		</view>
		<helang-compress ref="helangCompress"></helang-compress>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	import helangCompress from '@/components/helang-compress/helang-compress';
	export default {
		components: {
			helangCompress
		},
		data() {
			return {

				bankimg: '',
				getText: '获取验证码',
				seconds: '60',
				date: "",
				showTime: false,
				bank_id: '',
				timeparms: {
					year: true,
					month: true,
					day: false,
					hour: false,
					minute: false,
					second: false,
					// 选择时间的时间戳
					timestamp: false,
				},
				forminfo: {
					card_pic: '',
					bank_number: '',
					bank_name: '',
					mobile: '',
					code: '',
				},
				rules: {
					card_pic: [{
						required: true,
						message: '请上传储蓄卡正面照片',
						trigger: 'blur'
					}],
					bank_name: [{
						required: true,
						message: '请选择开户银行',
						trigger: 'blur'
					}],
					bank_number: [{
						type: 'number',
						required: true,
						message: '请填写储蓄卡号',
						trigger: 'blur'
					}],
					mobile: [{
							type: 'number',
							required: true,
							message: '请输入手机号',
							trigger: 'blur'
						},
						{
							validator: (rule, value, callback) => {
								return this.$u.test.mobile(value);
							},
							message: '手机号码不正确'
						}
					],
					code: [{
						type: 'number',
						min: 6,
						required: true,
						message: '验证码长度为6位',
						trigger: 'blur'
					}]
				},
				btnStyle: {
					background: 'linear-gradient(270deg,rgba(255,186,0,1),rgba(255,207,0,1))',
					height: '90rpx',
					color: '#FFF',
					border: 'none'
				},
				bankList: ''

			};
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		methods: {
			addCard() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						this.sub()
					} else {
						return;
					}
				});
			},
			codeChange(text) {
				this.getText = text;
			},
			showBankList() {
				uni.navigateTo({
					url: 'bankList'
				})
			},
			async chooseImg() {
				let _self = this;
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed '],
					async success(e) {
						
						let filePath = e.tempFilePaths[0];
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

					}
				})
			},
			async uploadImg(filePath){
				let _self = this;
				uni.showLoading({
					mask: true,
					title: ''
				})
				let res = await _self.http.uploadFile({
					api_source: 'app',
					uri: '/Uploads/image',
					method: 'POST',
					device: 'web',
					data: {
						image: filePath,
					}
				})
				if (res.data.status == 1) {
					_self.forminfo.card_pic = res.data.body.pathurl
					_self.bankimg = res.data.body.httpurl
					_self.recognition(filePath)
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
			},
			async recognition(file) {
				let res = await this.http.uploadFile({
					api_source: 'app',
					uri: '/Basic/card_identification',
					method: 'POST',
					device: 'web',
					data: {
						image: file
					},
					formData: {
						'type': '2'
					}
				})
				uni.hideLoading();
				if (res.data.status == 1) {
					this.$u.toast('上传照片成功');
					this.forminfo = Object.assign(this.forminfo, res.data.body)
					this.forminfo.bank_name = '';
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
			},
			async getCode() {
				if (this.$refs.uCode.canGetCode) {
					if (!this.$u.test.mobile(this.forminfo.mobile)) {
						this.$u.toast('请输入正确的手机号');
						return;
					}
					uni.showLoading({
						title: '正在获取验证码'
					})
					let res = await this.http.request({
						api_source: 'app',
						uri: '/PayBank/send_verify',
						method: 'POST',
						device: 'web',
						data: {
							reserved_mobile: this.forminfo.mobile,
							uid: this.userInfo.uid
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
			selectedDate(e) {
				let year = e.year;
				this.forminfo.valid_date = e.month + '/' + e.year.substr(2, e.year.length)
			},
			async sub() {
				uni.showLoading({
					title: ''
				})
				let res = await this.http.request({
					api_source: 'app',
					uri: '/PayBank/new_add_card',
					method: 'POST',
					device: 'web',
					data: {
						reserved_mobile: this.forminfo.mobile,
						uid: this.userInfo.uid,
						bank_id: this.bank_id,
						card_no: this.forminfo.bank_number,
						verify: this.forminfo.code,
						card_type: 'DC',
						card_pic: this.forminfo.card_pic
					}
				})
				console.log(res);
				if (res.data.status == 1) {
					this.$u.toast('绑卡成功');
					let pages = getCurrentPages(); //获取所有页面栈实例列表
					let prevPage = pages[pages.length - 2]; //上一页页面实例
					if (prevPage.route.indexOf('security') != -1) {
						uni.switchTab({
							url: '../index/index'
						})
					} else if (prevPage.route.indexOf('card') != -1) {
						prevPage.$vm.initData();
						uni.navigateBack();
					}

				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
				uni.hideLoading();
			}

		}
	}
</script>

<style lang="scss">
	page {
		background: #F2F2F2;
	}

	.form {
		background: #FFF;
		padding: 0 30rpx;

		.tips {
			margin: 20rpx auto;
			width: 330rpx;

			view {
				line-height: 1.5;
			}
		}
	}

	.subbtn {
		margin: 50rpx 30rpx;
		padding-bottom: 50rpx;
	}

	.slot-btn {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: 40rpx auto;
		height: 300rpx;
		width: 500rpx;
		overflow: hidden;
		background: #F2F2F2;
		border-radius: 20rpx;
		border: none;

		.text {
			font-size: 30rpx;
			color: #FFBA00;
			margin-top: 10rpx;
		}
	}
</style>
