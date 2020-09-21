<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		methods: {
			...mapMutations(['login', 'pushUser', 'getUsers', 'pushChange','setSecurity']),
			clearBadge() {
				if (plus.os.name.toLowerCase() == 'ios') {
					//导入ios UIApplication  
					var UIApplication = plus.ios.import("UIApplication");
					var app = UIApplication.sharedApplication();
					//获取应用图标的数量  
					// var oldNum = app.applicationIconBadgeNumber();  
					// var newNum = oldNum - 1;  
					//设置应用图标的数量  
					plus.runtime.setBadgeNumber(0);
					//导入个推原生类  
					var GeTuiSdk = plus.ios.importClass('GeTuiSdk');
					GeTuiSdk.setBadge(0);
				}
			}
		},
		computed: {
			...mapState(['pushState'])
		},
		onLaunch: function() {
			// #ifdef APP-PLUS
			plus.screen.lockOrientation('portrait-primary');
			
			// #endif
			let that = this;
			let user = uni.getStorageSync('userInfo') || '';
			let users = uni.getStorageSync('userInfos') || '';
			uni.getStorage({
				key: 'pushState',
				success: (res) => {
					that.pushChange(res.data);
				},
				fail() {
					that.pushChange(true);
				}
			})
			uni.getStorage({
				key: 'checkedSecurity',
				success: (res) => {
					that.setSecurity(res.data);
				}
			})
			if (user.uid) {
				uni.getStorage({
					key: 'userInfo',
					success: (res) => {
						this.login(res.data);
						if (users) {
							uni.getStorage({
								key: 'userInfos',
								success: (e) => {
									that.getUsers(e.data);
								}
							})
						} else {
							that.pushUser(res.data);
						}
					}
				})
			}
			this.clearBadge();
		},
		onShow: function() {

		},
		onHide: function() {

		}
	};
</script>

<style lang="scss">
	@import "@/components/uview-ui/index.scss";

	/* 解决头条小程序组件内引入字体不生效的问题 */
	/* #ifdef MP-TOUTIAO */
	@font-face {
		font-family: uniicons;
		src: url('/static/uni.ttf');
	}

	/* #endif */

	/* #ifndef APP-PLUS */
	page {
		width: 100%;
		min-height: 100%;
		display: flex;
	}

	/* #endif */
</style>
