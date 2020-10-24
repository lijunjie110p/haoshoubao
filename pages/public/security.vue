<template>
	<view class="main">
		<view class="headpic">
			<u-divider bg-color="tranfrom" color="#DEBB91" border-color="#DEBB91" fontSize="50">身份认证</u-divider>
		</view>
		<view class="upload u-padding-30">
			<view><text>上传身份证照片</text></view>
			<view class="slot-btn" @click="upload('y')">
				<u-image @click="upload('y')" v-if="prosimg==''" width="90rpx" height="90rpx" src="https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-08-04/5f2951f3524e0.png"></u-image>
				<view v-if="prosimg==''" class="text"><text>正面照片</text></view>
				<u-image @click="upload('y')" v-if="prosimg!=''"  width="100%" mode="widthFix" :src="prosimg"></u-image>
			</view>
			<view class="slot-btn" @click="upload('n')">
				<u-image @click="upload('n')" v-if="consimg==''" width="90rpx" height="90rpx" src="https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-08-04/5f2951f3524e0.png"></u-image>
				<view v-if="consimg==''" class="text"><text>背面照片</text></view>
				<u-image @click="upload('n')" v-if="consimg!=''"  width="100%" mode="widthFix" :src="consimg"></u-image>
			</view>
		</view>
		<u-gap height="20" bg-color="#F2F2F2"></u-gap>
		<view class="form">
			<u-form :error-type="['toast']" :model="formData" ref="uForm">
				<u-form-item label-width="130" label="真实姓名" prop="mobile">
					<u-input type="text" v-model="formData.name" placeholder="请输入真实姓名"> </u-input>
				</u-form-item>
				<u-form-item label-width="130" label="身份证号" prop="id">
					<u-input type="text" v-model="formData.id" placeholder="请输入15位或18位身份证号"> </u-input>
				</u-form-item>
				<u-form-item label-width="130" label="当前区域" prop="region">
					<u-input type="select" v-model="formData.region" @click="showRegion = true" placeholder="请选择地区"> </u-input>
					<u-picker confirm-color="#FFBA37" :safe-area-inset-bottom="true" @confirm="selectedRegion" mode='region'
					 :default-region="area" v-model="showRegion"></u-picker>
				</u-form-item>
			</u-form>
			<view class="u-font-24 u-margin-top-20 u-type-warning">温馨提示：请谨慎选择注册城市，定位城市选择会影响城主模式收益！</view>
		</view>
		<view class="foot">
			<view>
				<u-button :custom-style="subbtn" @click="sub">提交</u-button>
			</view>
			<view class="u-line-2 u-font-24 u-type-info u-margin-top-30">
				<text>为保障您的《账户资金安全》和《银联》及《工信部》相关规定需进行实名认证</text>
			</view>
			<view class="u-line-2 u-font-24 u-type-info u-margin-top-30">
				<text>注：需保证姓名、身份证、银行卡开户为同一人，提交后不可更改，请确认填写信息准确无误</text>
			</view>
		</view>
		<helang-compress ref="helangCompress"></helang-compress>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	import helangCompress from '@/components/helang-compress/helang-compress';
	export default {
		components: {
			helangCompress
		},
		data() {
			return {
				formData: {
					name: '',
					id: '',
					region: ''
				},
				area: [],
				rules: {
					name: [{
						required: true,
						message: '请输入真实姓名',
						trigger: 'blur'
					}],
					id: [{
						required: true,
						min: 15,
						max: 18,
						message: '身份证长度15位或18位身份证号',
						trigger: 'blur'
					}],
					region: [{
						required: true,
						message: '请选择地区',
						trigger: 'blur'
					}]
				},
				showRegion: false,
				prosimg: '',
				prosFile: '', //正面照片文件
				consimg: '',
				consFile: '', //反面照片文件
				subbtn: {
					background: 'linear-gradient(270deg, rgba(255, 186, 0, 1), rgba(255, 207, 0, 1))',
					boxShadow: '0px 8px 12px 0px rgba(255, NaN, 189, 0.35)',
					color: '#FFF'
				}
			};
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		onLoad() {

		},
		onReady() {
			let _self = this;
			uni.getLocation({
				geocode: true,
				type: 'gcj02',
				success(res) {
					_self.formData.region = res.address.province + '-' + res.address.city + '-' + res.address.district;
				}
			})
		},
		methods: {
			...mapMutations(['login']),
			selectedRegion(e) {
				console.log(e)
				this.formData.region = `${e.province.label}-${e.city.label}-${e.area.label}`
				this.area = [e.province.label, e.city.label, e.area.label]
			},
			sub() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						this.security()
					} else {
						return;
					}
				});
			},
			async security() {

				if (this.prosFile == '' || this.consFile == '') {
					this.$u.toast('请上传身份证照片')
				}
				uni.showLoading({
					mask: true,
					title: ''
				})
				let res = await this.http.request({
					api_source: 'app',
					uri: '/Basic/identity',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
						realname: this.formData.name,
						idcardno: this.formData.id,
						create_area_location: this.formData.region,
						idcard_front: this.prosFile,
						idcard_back: this.consFile
					}
				})
				if (res.data.status == 1) {
					this.userInfo.is_auditing = '2'
					this.login(this.userInfo)
					this.$u.toast('身份认证成功');
					uni.navigateTo({
						url: '../card/applyCash'
					})
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
				uni.hideLoading()
			},
			upload(parms) {
				let _self = this;
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					success(e) {
						const Max_size = 300 * 1024;
						if (e.tempFiles[0].size >= Max_size) {
							let qa = (Max_size / e.tempFiles[0].size).toFixed(2) * 100
							_self.$refs.helangCompress.compress({
								src: e.tempFilePaths[0],
								maxSize: 800,
								fileType: 'jpg',
								quality: qa,
								type:parms,
							}).then((res) => {
								_self.uploadImg(parms, res)
							}).catch((err) => {
								console.log(err)
							});

						} else {
							_self.uploadImg(parms, e.tempFilePaths[0])
						}


					},
					fail(e) {
						console.log(e)
					}
				})
			},
			async uploadImg(parms, file) {
				uni.showLoading({
					mask: true,
					title: ''
				})
				let res = await this.http.uploadFile({
					api_source: 'app',
					uri: '/Uploads/image',
					method: 'POST',
					device: 'web',
					data: {
						image: file,
					}
				})

				if (res.data.status == 1) {
					if (parms == 'y') {
						this.prosimg = res.data.body.httpurl
						this.prosFile = res.data.body.pathurl
						this.recognition(file)
					} else if (parms == 'n') {
						this.consimg = res.data.body.httpurl
						this.consFile = res.data.body.pathurl
						uni.hideLoading()
						this.$u.toast('上传照片成功');
					}

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
						'type': ''
					}
				})
				uni.hideLoading()
				if (res.data.status == 1) {
					this.$u.toast('上传照片成功');
					this.formData.name = res.data.body.realname;
					this.formData.id = res.data.body.idcard;
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
	page {
		background: #F2F2F2;
	}

	.main {
		background-image: url('https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-08-04/5f2947663396b.png');
		background-size: 100% 216rpx;
		background-repeat: no-repeat;
	}

	.headpic {
		height: 200rpx;
		display: flex;
		justify-content: center;
		align-items: center;

		.title {
			font-size: 50rpx;
			color: #DEBB91;
			font-weight: 400;
		}
	}

	.form {
		padding: 30rpx;
		border-radius: 20rpx 20rpx 0 0;
		overflow: hidden;
		background: #FFF;
		z-index: 999;
	}

	.upload {
		padding: 30rpx;
		background: #FFF;

		.u-upload {
			justify-content: center;
		}

		.slot-btn {
			text-align: center;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			margin: 40rpx auto;
			height: 330rpx;
			width: 600rpx;
			border: 1px solid #dcdcdc;
			overflow: hidden;

			.text {
				font-size: 30rpx;
				color: #FFBA00;
				margin-top: 10rpx;
			}
		}
	}

	.foot {
		padding: 70rpx 30rpx;
	}
</style>
