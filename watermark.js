
// (function(global){

	var config = {
		upload : "#upload",               //上传
		rotate : "#rotate",               //旋转
		create : "#create",               //生成
		download : "#download",           //下载
		image : "#image",          	      //图片
		text : "#text",                   //水印文字
		fontSize : "#fontSize",           //水印字号
		fontFamily : "#fontFamily",       //水印字体
		position : "#position",           //水印位置
		margin : "#margin" ,              //水印距离图片边界的距离
		color : "#color",                 //水印颜色
		format : "#format"                //保存格式
	}

	var query = function (sel, ctx) {
		ctx = ctx || document;
		return ctx.querySelector(sel);
	}

	var queryAll = function (sel, ctx) {
		ctx = ctx || document;
		return ctx.querySelectorAll(sel);
	}

	var forEach = function (arr, fn) {
		for (var i = 0, len = arr.length; i < len; i++) {
			fn(i, arr[i], arr);
		}
	}

	var log = function (msg) {
		if (typeof msg === "string" && query("h1")) {
			query("h1").innerHTML = msg;
		}
	}

	var show = function (ele) {
		ele.style.display = "inline-block";
	}

	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");

	var image = query(config.image);

	var uploader = document.createElement("input");
		uploader.type = "file";
		uploader.id = "uploader";
	var file,
		originalData;

	uploader.onchange = upload;

	query(config.upload).onclick = function () {
		uploader.click();
	}

	function upload() {
		file = uploader.files[0];
		if (!file) {
			log("请选择一张图片");
			return;
		}
		if (/^image\/(?:png|jpeg|gif|bmp)$/.test(file.type)) {
			log("图片：" + file.name + "<br>大小：" + _fixSize(file.size));
			var fileReader = new FileReader();
			fileReader.readAsDataURL(file);
			fileReader.onload = function () {
				var temp = new Image();
				temp.src = this.result;
				temp.onload = function () {
					canvas.width = temp.width;
					canvas.height = temp.height;
					image.style.width = temp.width > 300 ? "100%" : "";
					query(config.fontSize).value = parseInt(temp.width/20+10);
					query(config.margin).value = parseInt(temp.width/50+10);
					ctx.drawImage(temp, 0, 0);
					image.src = originalData = temp.src;
					show(query(config.rotate));
					show(query(config.create));
					show(query(config.download));
				}
			}
		} else {
			log("你选择的不是图片，请选择一张图片");
		}
	}

	function _fixSize (size) {
		if (size/1024 > 1024) {
			return (size/1024/1024).toFixed(2) + "M";
		} else if (size < 1024) {
			return size + "b";
		} else {
			return (size/1024).toFixed(2) + "k";
		}
	}

	query(config.create).onclick = create;

	var eles = (function () {
		var arr = [],
			ids = ["text", "fontSize", "fontFamily", "position", "margin", "color"];
		forEach(ids, function(i, id) {
			arr[arr.length] = query(config[id]);
		})
		return arr;
	})();
	forEach(eles, function (i, ele) {
		ele.onchange = create;
	})

	function create() {
		if (!file) {
			log("请先上传一张图片");
			return;
		}
		image.src = originalData;
		image.onload = function () {
			ctx.drawImage(image, 0, 0);
			var fontSize = _fixNum(query(config.fontSize), parseInt(canvas.width/20+10));
			var fontFamily = query(config.fontFamily).value;
			var color = query(config.color).value;
			var position = getPosition(query(config.position).value);
			ctx.font = fontSize + "px " + fontFamily;
			ctx.fillStyle = color;
			ctx.textAlign = position.align;
			ctx.textBaseline = position.baseline;
			ctx.fillText(query(config.text).value || "", position.x, position.y);
			image.src = canvas.toDataURL(file.type);
			image.onload = null;
		}
	}

	function _fixNum(ele, num) {
		var val = ele.value;
		if (val === "") {
			ele.value = num;
			return num;
		} else {
			return /[^0-9]/.test(val) ? num : val;
		}
	}

	query(config.rotate).onclick = function () {
		if (!file) {
			log("请先上传一张图片");
			return;
		}
		image.src = originalData;
		image.onload = function () {
			var x = canvas.width;
			var y = canvas.height;
			ctx.drawImage(image, 0, 0);
			var imageData = ctx.getImageData(0, 0, x, y);
			var temp1 = [];
			for (var i = 0; i < x; i++) {
				temp1[i] = [];
				for (var j = 0; j < y; j++) {
					temp1[i][j] = 0;
				}
			}
			var temp2 = [];
			for (var i = 0; i < y; i++) {
				temp2[i] = [];
				for (var j = 0; j < x; j++) {
					temp2[i][j] = 0;
				}
			}
			for (var i = 0, len = imageData.data.length; i < len; i+=4) {
				temp1[i/4%x][Math.floor(i/4/x)] = [
					imageData.data[i],
					imageData.data[i+1],
					imageData.data[i+2],
					imageData.data[i+3]
				];
			}
			for (var i = 0; i < x; i++) {
				for (var j = 0; j < y; j++) {
					temp2[y-j-1][i] = temp1[i][j];
				}
			}
			canvas.width = y;
			canvas.height = x;
			imageData = ctx.getImageData(0, 0, y, x);
			for (var i = 0, len = imageData.data.length; i < len; i+=4) {
				imageData.data[i] = temp2[i/4%y][Math.floor(i/4/y)][0];
				imageData.data[i+1] = temp2[i/4%y][Math.floor(i/4/y)][1]; 
				imageData.data[i+2] = temp2[i/4%y][Math.floor(i/4/y)][2];
				imageData.data[i+3] = temp2[i/4%y][Math.floor(i/4/y)][3];
			}
			ctx.putImageData(imageData, 0, 0);
			originalData = canvas.toDataURL(file.type);
			create();
			image.onload = null;
		}
	}

	query(config.download).onclick = function () {
		if (!file) return;
		var type = _fixType(query(config.format).value);
		var imageData = canvas.toDataURL(type)/*.replace(type,"image/octet-stream")*/;
		open(imageData);
		/*var name = _fixName(file.name) + _timestamp() + "." + type;
		var link = document.createElement("a");
		link.href = data;
		link.download = name;
		link.click();
		link = null;*/
	}

	function _fixType(type) {
		type = type.toLowerCase().replace(/jpg/,"jpeg");
		return "image/" + type.match(/png|jpeg|bmp|gif/)[0];
	}

	function _fixName(name) {
		var prefix = "-";
		if (name.indexOf("_") !== -1) {
			prefix = "_";
		}
		return name.slice(0, name.lastIndexOf(".")) + prefix;
	}

	function _timestamp() {
		var now = new Date(),
			timestamp = "";
		var _prefix = function (t) {
			return t < 10 ? "0"+t : ""+t;
		}
		forEach([now.getFullYear(), now.getMonth()+1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()], function (i, val) {
			timestamp += _prefix(val);
		})
		return timestamp;
	}

	function getPosition (position) {
		var margin = _fixNum(query(config.margin), parseInt(canvas.width/50+10));
		return {
			lefttop : {
				align : "left",
				baseline : "top",
				x : margin,
				y : margin
			},
			centertop : {
				align : "center",
				baseline : "top",
				x : canvas.width/2,
				y : 5
			},
			righttop : {
				align : "right",
				baseline : "top",
				x : canvas.width-margin,
				y : margin
			},
			leftmiddle : {
				align : "left",
				baseline : "middle",
				x : margin,
				y : canvas.height/2
			},
			centermiddle : {
				align : "center",
				baseline : "middle",
				x : canvas.width/2,
				y : canvas.height/2
			},
			rightmiddle : {
				align : "right",
				baseline : "middle",
				x : canvas.width-margin,
				y : canvas.height/2
			},
			leftbottom : {
				align : "left",
				baseline : "bottom",
				x : margin,
				y : canvas.height-margin
			},
			centerbottom : {
				align : "center",
				baseline : "bottom",
				x : canvas.width/2,
				y : canvas.height-margin
			},
			rightbottom : {
				align : "right",
				baseline : "bottom",
				x : canvas.width-margin,
				y : canvas.height-margin
			}
		}[position];
	}

	// global.watermark = config;

// })(window);