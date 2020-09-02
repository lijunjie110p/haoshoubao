<template>
	<view class="container">
		<view>
			<u-form :error-type="['toast']" :model="registeInfo" ref="uForm">
				<u-form-item label-width="130" label="手机号" prop="mobile">
					<u-input type="number" v-model="registeInfo.mobile" placeholder="请填写手机号"> </u-input>
				</u-form-item>
				<u-form-item label-width="130" label="验证码" prop="code">
					<u-input type="number" maxlength="6" v-model="registeInfo.code" placeholder="请填写验证码"> </u-input>
					<u-button :custom-style="{background:'#FFBA37',color:'#FFF',fontSize:'24rpx',height:'60rpx',lineHeight:'60rpx'}"
					 slot="right" @click="getCode">{{getText}}</u-button>
					<u-verification-code :seconds="seconds" ref="uCode" @change="codeChange"></u-verification-code>
				</u-form-item>
				<u-form-item label-width="130" label="邀请码" prop="code">
					<u-input type="number" v-model="registeInfo.invite_code" placeholder="请输入邀请码"> </u-input>
				</u-form-item>
			</u-form>
		</view>
		<view class="u-margin-top-30">
			<u-button  :custom-style="btnStyle"  @click="submit">注册</u-button>
		</view>

	</view>
</template>

<script>
	import {
		mapMutations
	} from 'vuex';
	export default {
		data() {
			return {
				registeInfo: {
					mobile: '',
					code: '',
					invite_code:''
				},
				codeTips: '',
				seconds: '60',
				getText: '获取验证码',
				area: ['', ''],
				rules: {
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
					}],
					invite_code:[
						{required: true,}
					]
				},
				btnStyle: {
					background: 'linear-gradient(270deg,rgba(255,186,0,1),rgba(255,207,0,1))',
					height: '90rpx',
					color: '#FFF',
					border: 'none',
					fontSize:'36rpx'
				},
			};
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		onLoad() {
			let _self = this;
			uni.getLocation({
				success(res) {
					_self.area[0] = res.latitude
					_self.area[1] = res.longitude;
				}
			});

		},
		methods: {
			...mapMutations(['login']),
			submit() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						this.toRegiste()
					} else {
						return;
					}
				});
			},
			async toRegiste() {
				uni.showLoading({
					mask: true,
					title: ''
				})
				let res = await this.http.request({
					api_source: 'app',
					uri: '/Registe/registe',
					method: 'POST',
					device: 'web',
					data: {
						mobile: this.registeInfo.mobile,
						verify: this.registeInfo.code,
						invite_code:this.registeInfo.invite_code,
						create_area_location: this.area,
					}
				})
				if (res.data.status == 1) {
					this.$u.toast('注册成功');
					this.toLogin(res.data.body)
				}
				uni.hideLoading();
			},
			toLogin(provider) {
				uni.navigateBack()
			},
			codeChange(text) {
				this.getText = text;
			},
			async getCode() {
				if (this.$refs.uCode.canGetCode) {
					if (!this.$u.test.mobile(this.registeInfo.mobile)) {
						this.$u.toast('清输入正确的手机号');
						return;
					}
					uni.showLoading({
						title: '正在获取验证码'
					})
					let res = await this.http.request({
						api_source: 'app',
						uri: '/Basic/verification',
						method: 'POST',
						device: 'web',
						data: {
							mobile: this.registeInfo.mobile,
							module: 'registe'
						}
					})
					if (res.data.status == 1) {
						uni.hideLoading();
						this.$u.toast('验证码已发送');
						this.$refs.uCode.start();
					}
				} else {
					this.$u.toast('倒计时结束后再发送');
				}
			},
		}
	}
</script>

<style lang="scss">

</style>
