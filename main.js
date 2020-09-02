import Vue from 'vue'
import App from './App'
import store from './store'
import uView from "@/components/uview-ui";
import MescrollBody from "@/components/mescroll-uni/mescroll-body.vue"
import MescrollUni from "@/components/mescroll-uni/mescroll-uni.vue"
import MpvueGestureLock from "@/components/xwa105-gesturePassword/mpvueGestureLock/gestureLocker.vue"
Vue.component('mescroll-body', MescrollBody)
Vue.component('mescroll-uni', MescrollUni)
Vue.component('mpvue-gesture-lock', MpvueGestureLock)
import {
	http
} from "./util/js/common.js"
Vue.use(uView);

Vue.prototype.http = http;
Vue.prototype.$store = store;
Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
	store,
	...App
})
app.$mount()
