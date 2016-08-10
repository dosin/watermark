(function(global) {

	var config = {
		upload: "#upload", //上传
		rotate: "#rotate", //旋转
		flip: "#flip", //翻转
		print: "#print", //添加水印
		save: "#save", //保存
		image: "#image", //图片
		text: "#text", //文字
		fontSize: "#fontSize", //字号
		color: "#color", //颜色
		fontFamily: "#fontFamily", //字体
		position: "#position", //位置
		margin: "#margin", //边距
	}

	var query = function(selector, context) {
		return (context || document).querySelector(selector);
	}

	var queryAll = function(selector, context) {
		return (context || document).querySelectorAll(selector);
	}

	var forEach = function(arr, fn) {
		if (Object.prototype.toString.call(arr) !== "[object Array]") {
			throw TypeError("First Argument is expected to be an Array")
		}
		for (var i = 0, len = arr.length; i < len; i++) {
			fn(i, arr[i], arr);
		}
	}

	var log = function(msg) {
		if (query(".tip") && typeof msg === "string") {
			query(".tip").innerHTML = msg;
		}
	}

	var show = function(ele) {
		ele.style.display = "inline-block";
	}

	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");

	var image = query(config.image);

	var uploader = document.createElement("input");
	uploader.type = "file";
	var file;
	var fileData;

	query(config.upload).onclick = function() {
		uploader.click();
	}

	uploader.onchange = function() {
		file = uploader.files[0];
		if (!file) return;
		upload(file)
	}

	function upload(file) {
		if (/^image\//.test(file.type)) {
			log("图片信息<br/>文件：" + file.name + "<br/>大小：" + _fixSize(file.size));
			var fileReader = new FileReader();
			fileReader.readAsDataURL(file);
			fileReader.onload = function() {
				var temp = new Image();
				fileData = temp.src = this.result;
				temp.onload = function() {
					if (temp.width < 100 || temp.height < 100) {
						log('图片尺寸太小了，换张尺寸大一点的图片');
						return;
					}
					canvas.width = temp.width;
					canvas.height = temp.height;
					query(config.fontSize).value = parseInt(temp.width / 20 + 10);
					query(config.margin).value = parseInt(temp.width / 50 + 10);
					show(query(config.rotate));
					show(query(config.flip));
					show(query(config.print));
					show(query(config.save));
					print();
				}
			}
		} else {
			log("这TM不是图片啊，请上传一张图片");
		}
	}

	function _fixSize(size) {
		if (size / 1024 > 1024) {
			return (size / 1024 / 1024).toFixed(2) + "M";
		} else if (size < 1024) {
			return size + "b";
		} else {
			return (size / 1024).toFixed(2) + "k";
		}
	}

	var uploading = false;
	var body = document.body;
	body.ondragenter = function(e) {
		if (uploading) return;
		var types = e.dataTransfer.types;
		if (types && /Files/.test(types)) {
		}
	}
	body.ondragover = function() {
		if (!uploading) return false;
	}
	body.ondrop = function(e) {
		if (uploading) return false;
		var files = e.dataTransfer.files
		if (files && files.length) {
			file = files[0];
			upload(file);
		}
		return false;
	}

	query(config.rotate).onclick = function() {
		if (!file) return;
		var temp = new Image();
		temp.src = fileData;
		temp.onload = function() {
			var x = canvas.width;
			var y = canvas.height;
			ctx.drawImage(temp, 0, 0);
			var tempData = ctx.getImageData(0, 0, x, y);
			var before = [];
			for (var i = 0; i < x; i++) {
				before[i] = [];
			}
			var after = [];
			for (var i = 0; i < y; i++) {
				after[i] = [];
			}
			for (var i = 0, len = tempData.data.length; i < len; i += 4) {
				before[i / 4 % x][Math.floor(i / 4 / x)] = [
					tempData.data[i],
					tempData.data[i + 1],
					tempData.data[i + 2],
					tempData.data[i + 3]
				];
			}
			for (var i = 0; i < x; i++) {
				for (var j = 0; j < y; j++) {
					after[y - j - 1][i] = before[i][j];
				}
			}
			canvas.width = y;
			canvas.height = x;
			tempData = ctx.getImageData(0, 0, y, x);
			for (var i = 0, len = tempData.data.length; i < len; i += 4) {
				tempData.data[i] = after[i / 4 % y][Math.floor(i / 4 / y)][0];
				tempData.data[i + 1] = after[i / 4 % y][Math.floor(i / 4 / y)][1];
				tempData.data[i + 2] = after[i / 4 % y][Math.floor(i / 4 / y)][2];
				tempData.data[i + 3] = after[i / 4 % y][Math.floor(i / 4 / y)][3];
			}
			ctx.putImageData(tempData, 0, 0);
			fileData = canvas.toDataURL(file.type);
			print();
		}
	}
	query(config.flip).onclick = function() {
		if (!file) return;
		var temp = new Image();
		temp.src = fileData;
		temp.onload = function() {
			var x = canvas.width;
			var y = canvas.height;
			ctx.drawImage(temp, 0, 0);
			var tempData = ctx.getImageData(0, 0, x, y);
			var before = [];
			var after = [];
			for (var i = 0; i < x; i++) {
				before[i] = [];
				after[i] = [];
			}
			for (var i = 0, len = tempData.data.length; i < len; i += 4) {
				before[i / 4 % x][Math.floor(i / 4 / x)] = [
					tempData.data[i],
					tempData.data[i + 1],
					tempData.data[i + 2],
					tempData.data[i + 3]
				];
			}
			for (var i = 0; i < x; i++) {
				for (var j = 0; j < y; j++) {
					after[x - i - 1][j] = before[i][j];
				}
			}
			for (var i = 0, len = tempData.data.length; i < len; i += 4) {
				tempData.data[i] = after[i / 4 % x][Math.floor(i / 4 / x)][0];
				tempData.data[i + 1] = after[i / 4 % x][Math.floor(i / 4 / x)][1];
				tempData.data[i + 2] = after[i / 4 % x][Math.floor(i / 4 / x)][2];
				tempData.data[i + 3] = after[i / 4 % x][Math.floor(i / 4 / x)][3];
			}
			ctx.putImageData(tempData, 0, 0);
			fileData = canvas.toDataURL(file.type);
			print();
		}
	}

	query(config.print).onclick = print;

	var eles = (function() {
		var arr = [],
			ids = ["text", "fontSize", "fontFamily", "position", "margin", "color"];
		forEach(ids, function(i, id) {
			arr[arr.length] = query(config[id]);
		})
		return arr;
	})();
	forEach(eles, function(i, ele) {
		ele.onchange = print;
	});

	function print() {
		if (!file) return;
		var temp = new Image();
		temp.src = fileData;
		temp.onload = function() {
			ctx.drawImage(temp, 0, 0);
			var fontSize = _fixNumber(query(config.fontSize), parseInt(canvas.width / 20 + 10));
			var fontFamily = query(config.fontFamily).value;
			var color = query(config.color).value;
			var position = _getPosition(query(config.position).value);
			ctx.font = fontSize + "px " + fontFamily;
			ctx.fillStyle = color;
			ctx.textAlign = position.align;
			ctx.textBaseline = position.baseline;
			ctx.fillText(query(config.text).value || "", position.x, position.y);
			image.src = canvas.toDataURL(file.type);
			image.style.width = temp.width > container.offsetWidth ? "100%" : "";
		}
	}

	function _fixNumber(ele, num) {
		var val = ele.value;
		if (val === "") {
			ele.value = num;
			return num;
		} else {
			return /[^0-9]/.test(val) ? num : val;
		}
	}

	function _getPosition(position) {
		var margin = _fixNumber(query(config.margin), parseInt(canvas.width / 50 + 10));
		return {
			lefttop: {
				align: "left",
				baseline: "top",
				x: margin,
				y: margin
			},
			centertop: {
				align: "center",
				baseline: "top",
				x: canvas.width / 2,
				y: margin
			},
			righttop: {
				align: "right",
				baseline: "top",
				x: canvas.width - margin,
				y: margin
			},
			leftmiddle: {
				align: "left",
				baseline: "middle",
				x: margin,
				y: canvas.height / 2
			},
			centermiddle: {
				align: "center",
				baseline: "middle",
				x: canvas.width / 2,
				y: canvas.height / 2
			},
			rightmiddle: {
				align: "right",
				baseline: "middle",
				x: canvas.width - margin,
				y: canvas.height / 2
			},
			leftbottom: {
				align: "left",
				baseline: "bottom",
				x: margin,
				y: canvas.height - margin
			},
			centerbottom: {
				align: "center",
				baseline: "bottom",
				x: canvas.width / 2,
				y: canvas.height - margin
			},
			rightbottom: {
				align: "right",
				baseline: "bottom",
				x: canvas.width - margin,
				y: canvas.height - margin
			}
		}[position];
	}

	query(config.save).onclick = function() {
		if (!file) return;
		open(canvas.toDataURL(file.type));
	}

	global.watermark = config;

})(window);