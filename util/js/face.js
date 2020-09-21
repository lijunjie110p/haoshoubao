import {http} from "./common.js"
import store from "../../store/index"
const PPFace = uni.requireNativePlugin('PP-BaiduFace');
export default{
	logoSrcs:[],
	inter(inx) {
		const _self = this;
		let config = {
			licenseName: 'idl-license',
			licenseSuffix: 'face-android',
			licenseId: 'hsb-face-android',
			liveActionArray: ["Eye", "Mouth", "HeadLeftOrRight"],
			bgColor: "#56445D",
			textColor: "#C5E99B",
			isSound: true, //默认是否开启语音提示（仅Android有效）默认值：false
			AutoClip: true, //自动裁剪用户脸部区域 默认：false
			isBackCamera: false //启用后置摄像头
		}
	
		if (plus.os.name == 'iOS') {
			config.licenseSuffix = 'face-ios';
			config.licenseId = 'hsb-face-ios';
		}
	
		if (inx == 1) {
			PPFace.faceliveness(config, result => {
				if (result.FaceStatusEnum == '"OK"') {
					_self.saveImgs(result.base64ImageMap);
				}else{
					_self.contrastError();
				}
			});
			if (plus.os.name == 'Android')
				setTimeout(function() {
					PPFace.ckcamera({}, result => {});
				}, 0);
		} else if (inx == 2) {
			PPFace.recycler(config, result => {
				if (result.FaceStatusEnum == '"OK"') {
					_self.saveImgs(result.base64ImageMap);
				}
			});
			if (plus.os.name == 'Android')
				setTimeout(function() {
					PPFace.ckcamera({}, result => {});
				}, 0);
		} else {
			PPFace.ckcamera({}, result => {});
		}
	
	},
	saveImgs(imgsobj) {
		let _self = this;
		_self.logoSrcs = [];
		for (let key in imgsobj) {
			var base64data = imgsobj[key];
			if (key == 'bestImage0') {
				_self.bitmapsave(base64data);
			}
		}
	},
	bitmapsave(basedata) {
		let _self = this;
		var bitmap = new plus.nativeObj.Bitmap("test");
		bitmap.loadBase64Data(basedata, function(e) {
			bitmap.save('_doc/_tmp/head' + new Date().getTime() + '.png', {}, function(e) {
				_self.logoSrcs.push(e.target);
				_self.updateImg(_self.logoSrcs[0])
				
			});
		}, function() {
			console.log('加载Base64图片数据失败：' + JSON.stringify(e));
		});
	},	//比对人脸
	async contrastSuccess(func){
		await func();
	},
	async contrastError(func){
		await func();
	},
	async contrast(imgUrl){
		let res = await http.request({
			api_source: 'app',
			uri: '/Face/match_face',
			method: 'POST',
			device: 'web',
			data: {
				uid: store.state.userInfo.uid,
				img_url: imgUrl
			}
		})
		uni.hideLoading();
		if (res.data.status == 1) {
			uni.showToast({
				title: '识别成功',
				icon: "none"
			})
			this.contrastSuccess();
		} else {
			uni.showToast({
				title: res.data.info,
				icon: "none"
			})
			this.contrastError();
		}
		
	},
	async updateFace(imgUrl) {			//上传人脸
		let res = await http.request({
			api_source: 'app',
			uri: '/Face/up_face',
			method: 'POST',
			device: 'web',
			data: {
				uid: store.state.userInfo.uid,
				img_url: imgUrl
			}
		})
		uni.hideLoading();
		if (res.data.status == 1) {
			store.state.userInfo.face_token = res.data.body.face_token;
			store.commit('login',store.state.userInfo);
		} else {
			uni.showToast({
				title: res.data.info,
				icon: "none"
			})
		}
	},		//上传图片
	async updateImg(filePath) {
		uni.showLoading()
		let res = await http.uploadFile({
			api_source: 'app',
			uri: '/Uploads/image',
			method: 'POST',
			device: 'web',
			data: {
				image: filePath,
			}
		})
		if (res.data.status == 1) {
			if (store.state.userInfo.face_token) {
				this.contrast(res.data.body.httpurl)
			} else {
				this.updateFace(res.data.body.httpurl)
			}
		} else {
			uni.showToast({
				title: res.data.info,
				icon: "none"
			})
		}
	}
}