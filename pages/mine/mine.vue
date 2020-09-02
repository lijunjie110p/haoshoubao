<template>
	<view class="main">
		<view class="user">
			<u-avatar @click="updateAvatar" :src="user.avatar" size="120"></u-avatar>
			<view class="u-flex-1 u-margin-left-30" @click="toLogin">
				<view class="u-flex u-row-between">
					<view class="name"><text>{{user.realname}}</text><text class="status">{{status}}</text></view>
					<view class="u-flex u-row-between">
						<u-image @click="jump('qrCode')" width="50rpx" height="50rpx" src="https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-07-30/5f2287990815b.png"></u-image>
						<u-image @click="jump('../setting/setting')" class="u-margin-left-45" width="50rpx" height="50rpx" src="https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-07-30/5f228899e8d08.png"></u-image>
					</view>
				</view>
				<view class="code u-flex u-row-between">
					<text>邀请码</text>
					<text class="u-margin-10">|</text>
					<text class="">{{user.invite_code}}</text></view>
			</view>
		</view>
		<view class="group">
			<view style="border-radius: 10px;overflow: hidden;">
				<u-cell-group :border="false">
					<u-cell-item :border-bottom="false" :title="message.title" :value="message.date">
						<u-image slot="icon" width="32" height="32" src="https://lanmao-res.oss-cn-qingdao.aliyuncs.com/static/style/2020-07-30/5f228d2e3fb84.png"></u-image>
					</u-cell-item>
				</u-cell-group>
			</view>
			<view class="card" @click="jump('../wallet/wallet')">
				<view class="title">我的钱包</view>
				<u-line color="#E2E2E2" />
				<view class="u-flex u-padding-30 u-row-between u-col-center u-text-center">
					<view>
						<view><text class="u-font-40"><b>{{data.all_income||0}}</b></text></view>
						<view><text class="u-font-28 u-margin-top-20">累计统计</text></view>
					</view>
					<view>
						<view><text class="u-font-40"><b>{{data.today_income||0}}</b></text></view>
						<view><text class="u-font-28 u-margin-top-20">今日收入</text></view>
					</view>
					<view>
						<view><text class="u-font-40"><b>{{data.before_income||0}}</b></text></view>
						<view><text class="u-font-28 u-margin-top-20">昨日收入</text></view>
					</view>
				</view>
			</view>
			<view class="card">
				<view class="title">我的服务</view>
				<u-line color="#E2E2E2" />
				<u-grid :col="4" :border="false">
					<u-grid-item @click="jump(item.jumpurl)" v-for="(item,i) in service_model" :key="i">
						<u-image @click="jump(item.jumpurl)" shape="circle" width="70rpx" height="70rpx" :src="item.param_img"></u-image>
						<text class="u-font-28 u-margin-top-15">{{item.param_name}}</text>
					</u-grid-item>
				</u-grid>
			</view>
		</view>
		<u-popup :safe-area-inset-bottom="true" border-radius="15" :closeable="true" v-model="showSecurity" mode="bottom"
		 length="80%">
			<view class="lock-tips">
				<view class="big-tips" :style="[needAuthenticate&&!pwdError?{color:'#999999'}:needAuthenticate&&pwdError?{color:'#FF0000'}:{color:''}]">{{text}}</view>
				<view class="small-tips" v-if="lockType == 2 || (lockType == 3 && !needAuthenticate)">请牢记您的密码，忘记后将无法找回</view>
			</view>
			<view class="container-lock">
				<mpvue-gesture-lock ref="mpvueGestureLock" :containerWidth="screenWidth" :cycleRadius="30" @end="onEnd" :password="password"></mpvue-gesture-lock>
			</view>
			<view class="container-confirm" v-if="showLockConfirm">
				<view class="lock-reset" @click="resetLock">重绘</view>
				<view :class="[confirmEnable?'':'disable-confirm']" @click="lockConfirm">确认</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	import face from "@/util/js/face.js"
	export default {
		data() {
			return {
				data: '',
				user: {
					realname: '',
					avatar: require('../../static/image/logo.png')
				},
				status: "未实名认证",
				message: {
					title: '',
					date: ''
				},
				service_model: {},
				showSecurity: false,
				password: [],
				screenWidth: '', //屏幕宽度
				screenHeight: '', //屏幕高度
				lockType: 1, //手势锁认证类型（1-解锁、2、注册、3-修改）
				needAuthenticate: true, //是否需要认证（解锁、修改需要和设定好的密码做认证）
				pwdError: false, //手势认证是否通过
				showLockConfirm: false, //是否显示确认
				text: '绘制你的手势图案，至少连接4个点',
				confirmEnable: false, //是否确认可点击
				errorTimes: 0, //认证失败次数(限制)
				maxErrorTimes: 100, //最多可以失败几次
				serverPwd: '', //用以验证的密码
				interval: '',
				maxtime: 300, //倒计时300秒
				needRz: true
			};
		},
		onLoad() {
			this.message.date = this.$u.timeFormat(new Date(), 'mm-dd');
			this.initData();
			this.getScreenHeight();
		},
		onShow() {
			this.needRz = this.checkedSecurity;
			this.initData();
			this.getmessage();
		},
		onPullDownRefresh() {
			this.initData();
		},
		computed: {
			...mapState(['hasLogin', 'userInfo','checkedSecurity'])
		},
		methods: {
			...mapMutations(['login']),
			getScreenHeight() {
				//测量屏幕宽度（得到的是px单位）
				const deviceInfo = uni.getSystemInfoSync();
				this.screenWidth = deviceInfo.screenWidth;
			},
			async getmessage() {
				let res = await this.http.request({
					api_source: 'app',
					uri: '/Home/notice',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
					}
				})
			},
			async initData() {

				let res = await this.http.request({
					api_source: 'app',
					uri: '/Member/myinfo',
					method: 'POST',
					device: 'web',
					data: {
						uid: this.userInfo.uid,
					}
				})
				if (res.data.status == 1) {
					this.data = res.data.body;
					this.user = res.data.body.userinfo || {}
					if (res.data.body.userinfo) {
						if (this.user.is_auditing == "2") {
							this.status = "已实名认证"
							this.user.realname = `*${this.user.realname.substr(this.user.realname.length-1,this.user.realname.length)}`
						} else {
							this.status = '未实名认证'
							this.user.realname = `未认证`
						}
					} else {
						this.user.realname = "未登录"
					}
					this.service_model = res.data.body.service_model
					for (let i in this.service_model) {
						if (this.service_model[i].param_id == 89) {
							this.service_model[i].jumpurl = '../public/webView?url=' + encodeURIComponent(this.service_model[i].param_url) +
								'&source=' + '../mine/mine';
						} else if (this.service_model[i].param_id == 90) {
							this.service_model[i].jumpurl = '../card/cardList?card_type=CC&source=channel'
						} else if (this.service_model[i].param_id == 91) {
							this.service_model[i].jumpurl = '../wallet/wallet'
						} else if (this.service_model[i].param_id == 92) {
							this.service_model[i].jumpurl = "../wallet/bill?source=profit"
						} else if (this.service_model[i].param_id == 93) {
							this.service_model[i].jumpurl = '../friend/friend'
						} else if (this.service_model[i].param_id == 99) {
							this.service_model[i].jumpurl = '../mine/service'
						} else if (this.service_model[i].param_id == 100) {
							this.service_model[i].jumpurl = '../setting/setting'
						} else if (this.service_model[i].param_id == 101) {
							this.service_model[i].jumpurl = '../setting/account'
						}else if (this.service_model[i].param_id == 115) {
							this.service_model[i].jumpurl = 'videoList'
						}else if (this.service_model[i].param_id == 117) {
							this.service_model[i].jumpurl = '../card/card'
						}else if (this.service_model[i].param_id == 118) {
							this.service_model[i].jumpurl = '../business/applyCard'
						}
					}
				} else {
					uni.showToast({
						title: res.data.info,
						icon: "none"
					})
				}
				uni.stopPullDownRefresh();
			},
			toLogin() {

				if (!this.hasLogin) {
					uni.navigateTo({
						url: '../public/login'
					});
					return false;
				} else if (this.user.is_auditing != '2') {
					uni.navigateTo({
						url: '../public/security'
					});
					return false;
				} else {
					return true
				}
			},
			// 上传头像
			updateAvatar() {
				if (!this.toLogin()) {
					return;
				}

				let _self = this;
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					async success(e) {
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
								image: e.tempFilePaths[0],
							}
						})

						if (res.data.status == 1) {
							let editres = await _self.http.request({
								api_source: 'app',
								uri: '/Basic/edit_avatar',
								method: 'POST',
								device: 'web',
								data: {
									uid: _self.user.uid,
									avatar: res.data.body.pathurl
								}
							})
							uni.hideLoading()
							if (editres.data.status == 1) {
								_self.user.avatar = editres.data.body.avatar;
								_self.$u.toast('上传头像成功');
							} else {
								uni.showToast({
									title: res.data.info,
									icon: "none"
								})
							}
						}
					},
					fail(e) {
						console.log(e)
					}
				})
			},
			jump(url) {
				let _self = this;
				if (url.indexOf('setting') != -1) {
					uni.navigateTo({
						url
					})
				} else if (url.indexOf('wallet/wallet') != -1 && this.data.is_prodect && this.toLogin()) {
					if (this.needRz) {
						face.contrastSuccess = function() {
							_self.toWallet(url);
						}
						face.inter(1)
					} else {
						uni.navigateTo({
							url
						})
					}
				} else if (this.toLogin()) {
					uni.navigateTo({
						url
					})
				}
			},
			toWallet(url){
				this.maxtime = 300; //解锁成功后5分钟内不用再解锁
				this.interval = setInterval(() => {
					if (this.maxtime >= 0) {
						this.maxtime--
						this.needRz = false;
					} else {
						this.maxtime = 300
						this.needRz = true;
						clearInterval(this.interval)
					}
				}, 1000)
				uni.navigateTo({
					url:url
				})
			},
			async onEnd(data) {
				/* ************首次绘制************ */
				this.password = data;
				if (this.lockType == 1) {
					//1、登录
					if (!this.overFailedTimes()) {
						//解锁
						console.log("密码：" + this.password.join(''));
						try {
							let res = await this.http.request({
								api_source: 'app',
								uri: '/Basic/contrast',
								method: 'POST',
								device: 'web',
								data: {
									uid: this.userInfo.uid,
									safe_lock: this.password.join('')
								}
							})
							if (res.data.status == 1) {
								this.text = '解锁成功';
								this.needAuthenticate = false;
								this.showSecurity = false;
								this.maxtime = 300; //解锁成功后5分钟内不用再解锁
								this.interval = setInterval(() => {
									if (this.maxtime >= 0) {
										this.maxtime--
										this.needRz = false;
									} else {
										this.maxtime = 300
										this.needRz = true;
										clearInterval(this.interval)
									}
								}, 1000)
								uni.navigateTo({
									url: '../wallet/wallet'
								})

							} else {
								uni.showToast({
									title: res.data.info,
									icon: "none"
								})
								this.certificationFailed();
							}

						} catch (e) {


						}
						this.password = [];
					}
				} else if (this.lockType == 2) {
					//2、注册
					this.firstDraw();
				} else if (this.lockType == 3) {
					//3、修改密码
					if (this.needAuthenticate) {
						console.log("认证失败次数1：" + this.errorTimes);
						if (!this.overFailedTimes()) {
							//修改需要先认证
							console.log("修改-密码认证：" + this.password.join(''));
							if ((this.password.join('')) == this.serverPwd) {
								uni.showToast({
									title: "手势认证通过",
									icon: "success",
									duration: 500
								});
								this.text = '手势认证通过';
								this.pwdError = false;

								setTimeout(res => {
									this.text = '绘制你的手势图案，至少连接4个点';
									this.needAuthenticate = false;
								}, 800);
							} else {
								this.certificationFailed();
							}
							this.password = [];
						}
					} else {
						//修改密码-第一次绘制(认证通过)
						this.firstDraw();
					}
				}

			},
			/* 注册、修改-第一次绘制手势 */
			firstDraw() {
				if (this.lockType == 1) {
					console.log("注册-绘制第一次");
				} else if (this.lockType == 3) {
					console.log("修改密码-重新设置第一次");
				}
				if (this.password.length < 4) {
					this.text = '至少连接4个点，请重新绘制';
					this.password = [];
				} else {
					this.text = '再次绘制图案进行确认';
					this.showLockConfirm = true;
				}
			},
			/* 注册、修改-第二次绘制手势 */
			secondDraw(pwdAgain) {
				if (this.lockType == 1) {
					console.log("注册-绘制第二次");
				} else if (this.lockType == 3) {
					console.log("修改密码-重新设置第二次");
				}

				if (this.password.join('') === pwdAgain.join('')) {
					this.text = '手势设定完成,点击确认完成设定';
					this.confirmEnable = true;
					// this.password = []
				} else {
					this.text = '两次手势设定不一致'
					this.confirmEnable = false;
					this.password = []
				}
			},
			/* 检查认证错误次数 */
			overFailedTimes() {
				if (this.errorTimes > this.maxErrorTimes - 1) {
					uni.showModal({
						title: "警告",
						content: "今日认证失败超过限制次数，你的设备已被锁定！",
						showCancel: false,
						confirmText: "好哒"
					});
					this.password = [];
					return true;
				}
				return false;
			},
			/* 手势认证失败 */
			certificationFailed() {
				this.text = '手势认证未通过';
				this.pwdError = true;
				this.needAuthenticate = true;
				this.errorTimes++;
				console.log("errorTimes:" + this.errorTimes + ";maxError:" + this.maxErrorTimes + ";error：" + this.pwdError +
					";need:" + this.needAuthenticate);
			},
			/* 确认手势密码 */
			async lockConfirm() {
				if (this.confirmEnable == true) {
					let safe_lock = this.password.toString().replace(/,/g, '')
					let res = await this.http.request({
						api_source: 'app',
						uri: '/Basic/set_prodect',
						method: 'POST',
						device: 'web',
						data: {
							uid: this.userInfo.uid,
							safe_lock
						}
					})
					if (res.data.status == 1) {
						this.$u.toast('设置成功')
						this.showSecurity = false;
					} else {
						uni.showToast({
							title: res.data.info,
							icon: "none"
						})
					}
				}
			},
			/* 重绘密码 */
			resetLock() {
				this.text = "绘制你的手势图案，至少连接4个点";
				this.password = [];
				//引入子组件文件，然后用ref给子组件一个id标识，然后通过this.$refs.组件名.组件方法;调用子组件方法
				this.$refs.mpvueGestureLock.refesh();
			}
		}
	}
</script>

<style lang="scss">
	page {
		background: #F2F2F2;
	}

	.user {
		background: linear-gradient(270deg, rgba(255, 186, 0, 1), rgba(255, 207, 0, 1));
		display: flex;
		align-items: center;
		height: 400rpx;
		padding: 0 30rpx;
		justify-content: space-between;

		.u-image {
			background-color: transparent;
		}

		.name {
			font-size: 40rpx;
			font-weight: bold;

			.status {
				border-radius: 5rpx;
				padding: 0 10rpx;
				background: rgba($color: #ffffff, $alpha: 0.3);
				color: #FFF;
				font-size: 24rpx;
				margin-left: 10rpx;
			}
		}

		.code {
			height: 50rpx;
			margin-top: 20rpx;
			background: linear-gradient(-90deg, rgba(255, 163, 32, 1), rgba(255, 184, 83, 1));
			border-radius: 50rpx;
			font-size: 28rpx;
			color: #FFF;
			padding: 0 20rpx;
			width: 280rpx;
		}
	}

	.group {
		position: absolute;
		top: 350rpx;
		left: 0;
		right: 0;
		padding: 0 30rpx;

		pad .u-cell-box {
			border-radius: 10px;
			overflow: hidden;
		}

		;

		.card {
			border-radius: 10px;
			margin: 30rpx 0;
			background: #FFFFFF;
			overflow: hidden;

			.title {
				font-size: 36rpx;
				font-weight: bold;
				padding: 25rpx;
			}
		}
	}

	.lock-tips {
		height: 100rpx;
		margin: 0 !important;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		justify-content: center;
	}

	.big-tips {
		font-size: 32rpx;
		color: #333333;
		text-align: center;
		font-weight: 500;
	}

	.small-tips {
		font-size: 24rpx;
		color: #999999;
		text-align: center;
		font-weight: 500;
		margin-top: 20rpx;
	}

	.container-lock {
		background-color: #FCFCFC;
	}

	.container-confirm {
		display: flex;
		width: 100%;
		height: 16%;
		position: absolute;
		bottom: 0;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		text-align: center;

		view {
			color: #666666;
			font-size: 28rpx;
			font-weight: 500;
			text-align: center;
			flex: 1;
			width: 80%;
			margin: 0 5%;
			height: 100rpx;
			line-height: 100rpx;
			border: 1px solid #F0F0F0;
			border-radius: 50rpx;
		}

		.disable-confirm {
			color: #A0A0A0;
			background-color: #F5F5F5;
		}
	}
</style>
