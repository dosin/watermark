
(function(global){

	var config = {
		// ID
		canvas : "canvas",               //canvas
		button : "button",               //生成水印
		download : "download",           //下载
		image : "image",                 //图片链接
		text : "text",                   //水印文字
		fontSize : "fontSize",           //水印字号
		fontFamily : "fontFamily",       //水印字体
		position : "position",           //水印位置
		color : "color",                 //水印颜色
		format : "format",               //保存格式
		margin : "margin",
		// 错误CSS className
		error : "error"
	}

	var g = function (id) {
		return typeof id === "string" ? document.getElementById(id) : null;
	}

	var canvas = g(config.canvas);
	var ctx = canvas.getContext("2d");
	var image = new Image;

	function draw(text, src) {
		g(config.image).className = "";
		text = text || "";
		image.src = src || "image.jpg";
		image.onload = function () {
			canvas.width = image.width;
			canvas.height = image.height;
			ctx.save();
			ctx.drawImage(image, 0, 0);
			ctx.font = handleNumber(g(config.fontSize).value, "16") + "px " + g(config.fontFamily).value;
			ctx.fillStyle = g(config.color).value;
			var position = g(config.position).value;
			ctx.textAlign = getPosition(position).align;
			ctx.textBaseline = getPosition(position).baseline;
			ctx.fillText(text, getPosition(position).x, getPosition(position).y);
			ctx.restore();
		}
		image.onerror = function () {
			g(config.image).value = "无法加载图片";
			g(config.image).className = config.error;
			g(config.image).focus();
		}
	}
	draw();

	function handleNumber(string, defaultValue) {
		var temp = string || defaultValue.toString();
		return /[^0-9]/.test(temp) ? defaultValue : temp;
	}

	g(config.button).onclick = function () {
		draw(g(config.text).value, g(config.image).value);
	}

	g(config.download).onclick = function () {
		if (!image.src) return;
		var type = g(config.format).value;
		var imageData = canvas.toDataURL(type).replace(_fixType(type),"image/octet-stream");
		var filename = "watermark" + _getTime() + "." + type;
		download(imageData, filename);
	}

	function _fixType(type) {
		type = type.toLowerCase().replace(/jpg/,"jpeg");
		return "image/" + type.match(/png|jpeg|bpm|gif/)[0];
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
			return "-" + (time < 10 ? "0" + time : time);
		}
		for (var p in t) {
			t[p] = _fixTime(t[p])
		}
		return t.y + t.mon + t.d + t.h + t.m + t.s;
	}

	function download(data, filename) {
		var link = document.createElement("a");
		link.href = data;
		link.download = filename;
		link.click();
	}

	function getPosition (position) {
		var margin = handleNumber(g(config.margin).value, 5);
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
