import md5Libs from "@/components/uview-ui/libs/function/md5";
let http = {
	plat_flag:'coll',
	app_host: 'https://api.huitye.com',		//api.huitye.com
	app_key: '784136644BE2CCE7390137B1E70E5D3E',		
	shop_host: 'https://otshop.sspuzi.com',
	shop_key: '984138644BE2CCE7390137B1E70A5G3E',
	host: '',
	key: '',
	device: '',
	data: {
		uri: '',
		data: {},
		callback: function() {},
	},
	request(parms) {
		var el = Object.assign(this.data, parms);
		if (el.api_source == 'shop') {
			this.host = this.shop_host
			this.key = this.shop_key
		} else if (el.api_source == 'app') {
			this.host = this.app_host
			this.key = this.app_key
		}
		this.device = el.device;
		// 签名
		var sign = this.sign(el.data, el.uri);
		// 请求数据接口
		return new Promise((resolve, reject) => {
			uni.request({
				url: sign.url,
				method: el.method || 'GET',
				data: el.data || {},
				header: {
					"Access-Control-Allow-Origin": "*",
					"Content-Type": "application/x-www-form-urlencoded"
				},
				success: (res) => {
					resolve(res)
				},
				fail: (err) => {
					uni.showToast({
						title: "请求失败"
					})
					reject(err)
				}
			})
		})
	},
	uploadFile(parms){
			var el = Object.assign(this.data, parms);
			if (el.api_source == 'shop') {
				this.host = this.shop_host
				this.key = this.shop_key
			} else if (el.api_source == 'app') {
				this.host = this.app_host
				this.key = this.app_key
			}
			this.device = el.device;
			let formData = {device:this.device}
			if(parms.formData){
				formData =Object.assign(formData,el.formData); 
			}
			// 签名
			var sign = this.sign(formData, el.uri);
			// 请求数据接口
			return new Promise((resolve, reject) => {
				uni.uploadFile({ 
					url: sign.url,
					filePath: el.data.image,
					formData:el.formData,
					name:'image',
					success: (res) => {
						res.data = JSON.parse(res.data);
						
						resolve(res)
					},
					fail: (err) => {
						uni.showToast({
							title: "请求失败"
						})
						reject(err)
					}
				})
			})
		
	},
	urlcode(form) {
		var data = Object.keys(form).map(function(key) {
			return encodeURIComponent(key) + "=" + form[key];
		}).join("&");
		return data;
	},
	ksort(obj) {
		var arr = new Array();
		var num = 0;
		for (var i in obj) {
			arr[num] = i;
			num++;
		}
		var sortArr = arr.sort();
		var sortObj = {};
		for (var i in sortArr) {
			sortObj[sortArr[i]] = obj[sortArr[i]];
		}
		return sortObj;
	},
	sign(gda, uri) {
		var form = Object.assign({
			device: this.device
		}, this.deleteEmptyProperty(gda));
		var stringSignTemp = this.urlcode(this.ksort(form)) + '&key=' + this.key;
		var get = Object.assign({
			device: this.device
		}, {
			sign: md5Libs.md5(stringSignTemp).toUpperCase()
		});
		var url = this.host + uri + '?' + this.urlcode(get);
		return {
			url: url,
			data: gda
		}
	},
	banksign(gda, uri){
			var form = Object.assign({
				device: this.device
			}, this.deleteEmptyProperty(gda));
			var stringSignTemp = this.urlcode(this.ksort(form)) 
			var get = Object.assign({
				device: this.device
			}, {
				sign: md5Libs.md5(stringSignTemp).toUpperCase()
			});
			var url = this.host + uri + '.api?' + this.urlcode(get);
			return {
				url: url,
				data: gda
			}
		
	},
	deleteEmptyProperty(object) {
		for (var i in object) {
			var value = object[i];
			if (typeof value === 'object') {
				if (Array.isArray(value)) {
					if (value.length == 0) {
						delete object[i];
						continue;
					}
				}
				this.deleteEmptyProperty(value);
				if (this.isEmpty(value)) {
					delete object[i];
				}
			} else {
				if (value === '' || value === null || value === undefined || value === 0) {
					delete object[i];
				}
			}
		}
		return object;
	},
	isEmpty(object) {
		for (var name in object) {
			return false;
		}
		return true;
	},
	getRequest(url) {
		var theRequest = new Object();
		if (url.indexOf("?") != -1) {
			var str = url.substr(1);
			var strs = str.split("&");
			for (var i = 0; i < strs.length; i++) {
				theRequest[strs[i].split("=")[0]] = (strs[i].split("=")[1]);
			}
		}
		return theRequest;
	},
	getUrlKey(name,url) {    //获取?后参数
	  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url) || [, ""])[1].replace(/\+/g, '%20')) || null
	},
}
export {
	http
}
