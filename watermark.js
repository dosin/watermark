
// (function(global){

	var config = {
		upload : "#upload",               //上传
		download : "#download",           //下载
		rotate : "#rotate",               //旋转
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

	var on = function (ele, types, fn) {
		types = types.split(" ");
		forEach(types, function (i, type) {
			if (ele.addEventListener) {
				ele.addEventListener(type, fn, false);
			} else if (ele.attachEvent) {
				ele.attachEvent("on"+type, fn);
			} else {
				ele["on"+type] = fn;
			}
		})
	}

	var log = function (msg) {
		if (typeof msg === "string" && query("h1")) {
			query("h1").innerHTML = msg;
		}
	}

	var fadeIn = function (ele) {
		if (typeof ele === "object" && ele.nodeType === 1) {
			ele.style.transition = "all 0.3s";
			ele.style.opacity = 1;
		}
	}

	var canvas = document.createElement("canvas"),
		ctx = canvas.getContext("2d");

	var image = query(config.image),
		originalData,
		file;

	var uploader = query("#uploader");
	if (!uploader) {
		uploader = document.createElement("input");
		uploader.type = "file";
		uploader.id = "uploader";
	}

	var upload = function () {
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
				}
			}
		} else {
			log("你选择的不是图片，请选择一张图片");
		}
	}

	function _fixSize (num) {
		var size;
		if (num/1024 > 1024) {
			size = (num/1024/1024).toFixed(2) + "M";
		} else if (num < 1024) {
			size = num + "b";
		} else {
			size = (num/1024).toFixed(2) + "k";
		}
		return size;
	}

	var create = function (text) {
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
			ctx.fillText(text || "", position.x, position.y);
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

	var rotate = function () {
		if (!file) {
			log("请先上传一张图片");
			return;
		}
		image.src = originalData;
		image.onload = function () {
			var x = canvas.width;
			var y = canvas.height;
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
				temp1[i/4%x][Math.floor(i/4/x)] = [imageData.data[i], imageData.data[i+1], imageData.data[i+2], imageData.data[i+3]];
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
		}
	}

	on(query(config.upload), "click", function () {
		uploader.click();
	});

	on(query("#rotate"), "click", function () {
		rotate();
	});

	on(uploader, "change", function () {
		upload();
	});

	var nodeList = function () {
		var arr = [],
			ids = [config.text, config.fontSize, config.fontFamily, config.position, config.margin, config.color];
		forEach(ids, function(i, id) {
			arr[arr.length] = query(id);
		})
		return arr;
	}
	forEach(nodeList(), function (i, ele) {
		on(ele, "change keyup", function () {
			create(query(config.text).value);
		});
	})

	on(query(config.download), "click", function () {
		if (!file) return;
		var type = query(config.format).value;
		var data = canvas.toDataURL(file.type).replace(_fixType(type),"image/octet-stream");
		var name = _fixName(file.name) + _timestamp() + "." + type;
		var link = document.createElement("a");
		link.href = data;
		link.download = name;
		link.click();
		link = null;
	});

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