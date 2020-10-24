<template>
	<view class="compress">
		<canvas :style="{ width: canvasSize.width,height: canvasSize.height}" canvas-id="myCanvas"></canvas>
		<canvas :style="{ width: canvasSize.width,height: canvasSize.height}" canvas-id="myCanvas2"></canvas>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				pic:'',
				canvasSize: {
					width: 0,
					height: 0
				}
			}
		},
		methods: {
			// 压缩
			compress(params) {
				return new Promise(async (resolve, reject) => {
					let info = await this.getImageInfo(params.src).then(info=>info).catch(err=>err);
					
					if(!info){
						reject('获取图片信息异常');
						return;
					}
					
					const maxSize = params.maxSize || 1080;

					let {width,height} = info;
					
					// 原图尺寸低于10则返回原图
					if(width < 10 || height < 10){
						resolve(params.src);
						return;
					}

					if (width > maxSize || height > maxSize) {
						if (width > height) {
							height = Math.floor(height / (width / maxSize));
							width = maxSize;
						} else {
							width = Math.floor(width / (height / maxSize));
							height = maxSize;
						}
					}

					this.canvasSize = {
						width: `${width}rpx`,
						height: `${height}rpx`
					}
					
					this.$nextTick(() => {
						setTimeout(() => {
							var ctx = '',canvasId;
							if(params.type == 'n'){
								canvasId = 'myCanvas2'
								ctx = uni.createCanvasContext('myCanvas2', this);
							}else{
								canvasId = 'myCanvas'
								 ctx = uni.createCanvasContext('myCanvas', this);
							}
							ctx.drawImage(info.path, 0, 0, uni.upx2px(width), uni.upx2px(height));
							ctx.draw(false, () => {
								uni.canvasToTempFilePath({
									x: 0,
									y: 0,
									width: uni.upx2px(width),
									height: uni.upx2px(height),
									destWidth: width,
									destHeight: height,
									canvasId: canvasId,
									fileType: params.fileType || 'jpg',
									quality: params.quality || 0.9,
									success: (res) => {
										// 在H5平台下，tempFilePath 为 base64
										resolve(res.tempFilePath);
									},
									fail:(err)=>{
										reject(err);
									}
								},this);
								
							});
						}, 500);
					})
				});
			},
			// 获取图片信息
			getImageInfo(src){
				return new Promise((resolve, reject)=>{
					uni.getImageInfo({
						src,
						success: (info)=> {
							resolve(info);
						},
						fail: () => {
							reject();
						}
					});
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.compress{
		position: fixed;
		width: 12px;
		height: 12px;
		overflow: hidden;
		top: -99999px;
		left: 0;
	}
</style>
