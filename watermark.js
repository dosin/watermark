
(function(global){

	var config = {
		canvas : "#canvas",               //canvas
		upload : "#upload",               //上传图片
		create : "#create",               //生成水印
		download : "#download",           //下载
		file : "#file",                   //上传控件
		text : "#text",                   //水印文字
		fontSize : "#fontSize",           //水印字号
		fontFamily : "#fontFamily",       //水印字体
		position : "#position",           //水印位置
		margin : "#margin" ,              //水印距离图片边界的距离
		color : "#color",                 //水印颜色
		format : "#format"                //保存格式
	}

	var query = function (seletor, context) {
		context = context || document;
		return context.querySelector(seletor);
	}

	var addEventListener = function (element, event, callback) {
		if (element.addEventListener) {
			element.addEventListener(event, callback, false);
		} else if (element.attachEvent) {
			element.attachEvent("on"+event, callback);
		} else {
			element["on"+event] = callback;
		}
	}

	var log = function (msg) {
		if (query("h1")) {
			query("h1").innerHTML = msg;
		}
	}

	var fadeIn = function (ele) {
		if (typeof ele === "object" && ele.nodeType === 1) {
			ele.style.opacity = 1;
		}
	}

	var canvas = query(config.canvas);
	var ctx = canvas.getContext("2d");
	var image = new Image();
	var fileReader = new FileReader(),
		file,
		filename;

	var upload = function () {
		file = query(config.file).files[0];
		if (!file) {
			log("请选择一张图片");
			return;
		}
		if (/^image\/(?:png|jpeg|gif|bmp)$/.test(file.type)) {
			filename = file.name
			log("图片：" + filename);
			fadeIn(query(config.create));
			fadeIn(query(config.download));
		} else {
			log("你选择的不是图片，请选择一张图片");
		}
	}

	var print = function (text) {
		text = text || "";
		if (!file) return;
		fileReader.readAsDataURL(file);
		fileReader.onload = function () {
			image.src = this.result;
		}
		image.onload = function () {
			canvas.width = image.width;
			canvas.height = image.height;
			var fontSize = _handleNumber(query(config.fontSize), image.width/20+10);
			var fontFamily = query(config.fontFamily).value;
			var color = query(config.color).value;
			var position = getPosition(query(config.position).value);
			ctx.save();
			ctx.drawImage(image, 0, 0);
			ctx.font = fontSize + "px " + fontFamily;
			ctx.fillStyle = color;
			ctx.textAlign = position.align;
			ctx.textBaseline = position.baseline;
			ctx.fillText(text, position.x, position.y);
			ctx.restore();
		}
	}

	function _handleNumber(ele, num) {
		var val = ele.value;
		num = parseInt(num);
		if (val === "") {
			ele.value = num;
			return num;
		} else {
			return /[^0-9]/.test(val) ? num : val;
		}
	}

	addEventListener(query(config.upload), "click", function () {
		query(config.file).click();
	});

	addEventListener(query(config.file), "change", function () {
		upload();
		print();
	});

	addEventListener(query(config.create), "click", function () {
		print(query(config.text).value);
	});

	addEventListener(query(config.download), "click", function () {
		if (!image.src) return;
		var type = query(config.format).value;
		var imageData = canvas.toDataURL(type).replace(_fixType(type),"image/octet-stream");
		var _finalName = _fixFileName(filename) + _getTime() + "." + type;
		var link = document.createElement("a");
		link.href = imageData;
		link.download = _finalName;
		link.click();
	}, false);

	function _fixType(type) {
		type = type.toLowerCase().replace(/jpg/,"jpeg");
		return "image/" + type.match(/png|jpeg|bmp|gif/)[0];
	}

	function _fixFileName(filename) {
		var pos = filename.lastIndexOf(".");
		return filename.slice(0, pos);
	}

	function _getTime() {
		var now = new Date();
		var t = {
			y : now.getFullYear(),
			mon : now.getMonth() + 1,
			d : now.getDate(),
			h : now.getHours(),
			m : now.getMinutes(),
			s : now.getSeconds()
		}
		var _fixTime = function (time) {
			return "_" + (time < 10 ? "0" + time : time);
		}
		for (var p in t) {
			t[p] = _fixTime(t[p])
		}
		return t.y + t.mon + t.d + t.h + t.m + t.s;
	}

	function getPosition (position) {
		var margin = _handleNumber(query(config.margin), canvas.width/50 + 10);
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

	global.watermark = config;

})(window);