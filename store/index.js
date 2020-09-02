import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		forcedLogin: false, //强制登陆
		hasLogin: false,
		isBindTaobao: false,
		userInfo: {},
		sonInfo: {},
		userInfos: [],
		pushState: true,
		checkedSecurity:false,
		pushCid: '',
	},
	mutations: {
		setSecurity(state, provider){
			state.checkedSecurity = provider;
			uni.setStorage({ //缓存用户推送
				key: 'checkedSecurity',
				data: provider
			})
		},
		//推送
		pushChange(state, provider) {
			state.pushState = provider;
			uni.setStorage({ //缓存用户推送
				key: 'pushState',
				data: provider
			})
			if (provider) {
				uni.subscribePush({
					success(e) {
						state.pushCid = e.clientid
						plus.push.addEventListener('click', function(msg) {
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
						})
						plus.push.addEventListener('receive', function(msg) {
							console.log("消息：" + msg)
						})
					}
				})
			} else {
				uni.unsubscribePush()
			}
		},
		login(state, provider) {
			state.hasLogin = true;
			provider.pushCid = state.pushCid
			state.userInfo = provider;
			if (provider.tk_special_id) {
				state.isBindTaobao = true
			} else {
				state.isBindTaobao = false
			}
			uni.setStorage({ //缓存用户登陆状态
				key: 'userInfo',
				data: provider
			})
		},
		logout(state) {
			state.hasLogin = false;
			state.userInfo = {};
			uni.removeStorage({
				key: 'userInfo'
			})
		},
		getUsers(state, provider) {
			state.userInfos = provider;
		},
		pushUser(state, provider) {

			let hasid = false;
			if (state.userInfos.length == 0) {
				state.userInfos.push(provider)
			} else {
				for (var i in state.userInfos) {
					if (provider.uid != state.userInfos[i].uid) {
						hasid = true;
					}
				}
				if (hasid) {
					state.userInfos.push(provider)
				}
			}
			uni.setStorage({
				key: 'userInfos',
				data: state.userInfos
			})
		},
		deleteUser(state, index) {
			state.userInfos.splice(index, 1)
			uni.setStorage({
				key: 'userInfos',
				data: state.userInfos
			})
		},
		saveSonInfo(state, provider) {
			state.sonInfo = provider;
			uni.setStorage({ //缓存下级
				key: 'sonInfo',
				data: provider
			})
		}
	},
	actions: {

	}
})

export default store
