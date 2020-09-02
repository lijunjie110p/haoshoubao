<template>
	<view class="main">
		<view class="tips" v-if="type!='add'&& disabled">
			<text>手机验证码将发送到<text>{{userInfo.mobile}}</text>手机上，请注意查收</text>
		</view>
		<view class="white-bg padding-width-base">

			<u-form :error-type="['toast']" :model="info" ref="uForm">
				<u-form-item label-width="130" label="手机号" prop="mobile">
					<u-input type="number" :disabled="disabled" v-model="info.mobile" :placeholder="placeholder"> </u-input>
				</u-form-item>
				<u-form-item label-width="130" label="验证码" prop="code">
					<u-input type="number" maxlength="6" v-model="info.code" placeholder="输入验证码"> </u-input>
					<u-button shape="circle" :plain="true" :custom-style="{background:'#FFF',color:'#FFBA00',fontSize:'24rpx',height:'60rpx',lineHeight:'60rpx'}"
					 slot="right" @click="getCode">{{getText}}</u-button>
					<u-verification-code :seconds="seconds" ref="uCode" @change="codeChange"></u-verification-code>
				</u-form-item>
			</u-form>
		</view>
		<view class="u-margin-30">
			<u-button :custom-style="btnStyle" @click="submit">
				<text >{{btnText}}</text>
			</u-button>
		</view>

	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	export default {
		data() {
			return {
				info: {
					mobile: '',
					code: ''
				},
				type: '',
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
					}]
				},
				btnStyle: {
					background: 'linear-gradient(270deg,rgba(255,186,0,1),rgba(255,207,0,1))',
					height: '90rpx',
					color: '#FFF',
					border: 'none',
					fontSize: '36rpx'
				},
				disabled: false,
				placeholder: '输入手机号',
				wxconfig:'',
				btnText:'提交'
			};
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		onLoad(parms) {

			let _self = this;
			_self.type = parms.type
			switch (parms.type) {
				case 'add':
					uni.setNavigationBarTitle({
						title: '添加账号'
					})
					this.btnText = '添加'
					break;
				case 'changeMobile':
					_self.disabled = true;
					this.btnText = '验证'
					_self.info.mobile = _self.userInfo.mobile;
					_self.placeholder = '输入新手机号'
					uni.setNavigationBarTitle({
						title: '修改手机号'
					})
					break;
				case 'changeWx':
				_self.disabled = true;
				_self.info.mobile = _self.userInfo.mobile;
				this.btnText = '更换'
					uni.setNavigationBarTitle({
						title: '更换微信'
					})
					
					break;
				default:
					break;
			}
			uni.getLocation({
				success(res) {
					_self.area[0] = res.latitude
					_self.area[1] = res.longitude;
				}
			});

		},
		computed: {
			...mapState(['hasLogin', 'userInfo', 'userInfos'])
		},
		methods: {
			...mapMutations(['login', 'pushUser', 'logout']),
			submit() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						if (!this.disabled) {
							this.toRegiste()
						} else {
							this.info.code = "";
							this.info.mobile = "";
							this.disabled = false;
							this.$refs.uCode.reset()
							this.$u.toast('验证成功');
							this.btnText = '修改'
						}
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
				let url = '',
					data = {},
					that = this;
				switch (this.type) {
					case 'add':
						url = '/Registe/login'
						data = {
							mobile: this.info.mobile,
							code: this.info.code,
							type: 2,
							create_area_location: this.area,
						}
						break;
					case 'changeMobile':
						url = '/Registe/change_mobile'
						data = {
							mobile: this.info.mobile,
							verify: this.info.code,
							uid: this.userInfo.uid,
							is_edit: 1
						}
						break;
					case 'changeWx':
						url = '/Registe/bind_wx'
						data = {
							unionid: this.wxconfig.unionId,
							uid: this.userInfo.uid
						}
						uni.login({
							provider: 'weixin',
							success(res) {
								uni.getUserInfo({
									provider: 'weixin',
									success(infoRes) {
										console.log(infoRes)
										_self.wxconfig = infoRes.userInfo;
									}
								})
							}
						})

						break;
					default:
						break;
				}
				let res = await this.http.request({
					api_source: 'app',
					uri: url,
					method: 'POST',
					device: 'web',
					data: data
				})
				uni.hideLoading();
				if (res.data.status == 1) {
					switch (this.type) {
						case 'add':
							let hasid = false;
							for(let i in this.userInfos){
								if(res.data.body.uid == this.userInfos[i].uid){
									hasid = true;
								}
							}
							if(hasid){
								this.$u.toast('已存在该账号')
							}else{
								this.pushUser(res.data.body)
								let pages = getCurrentPages(); //获取所有页面栈实例列表
								let prevPage = pages[pages.length - 2]; //上一页页面实例
								prevPage.$vm.data = this.userInfos;
								prevPage.$vm.user = this.userInfo;
								uni.navigateBack()
							}
							
							break;
						case 'changeMobile':
							this.logout();
							uni.reLaunch({
								url: 'login'
							})
							break;
						case 'changeWx':
							this.$u.toast('修改成功')
							uni.navigateBack();
							break;
						default:
							break;
					}
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
					if (!this.$u.test.mobile(this.info.mobile)) {
						this.$u.toast('清输入正确的手机号');
						return;
					}
					uni.showLoading({
						title: '正在获取验证码'
					})
					let model = ''
					switch (this.type) {
						case 'add':
							model = 'login'
							break;
						case 'changeMobile':
							model = 'change_mobile'
							break;
						case 'changeWx':
							model = 'bind_wx'
							break;
						default:
							break;
					}
					let res = await this.http.request({
						api_source: 'app',
						uri: '/Basic/verification',
						method: 'POST',
						device: 'web',
						data: {
							mobile: this.info.mobile,
							module: model
						}
					})
					if (res.data.status == 1) {
						uni.hideLoading();
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
		}
	}
</script>

<style lang="scss">
	page {
		background: #F2F2F2;
	}

	.tips {
		background-color: #F2F2F2;
		color: #999;
		padding: 20rpx 30rpx;
		font-size: 24rpx;
	}
</style>
