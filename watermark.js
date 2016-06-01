
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

	var query = function (selector, context) {
		return (context || document).querySelector(selector);
	}

	var queryAll = function (selector, context) {
		return (context || document).querySelectorAll(selector);
	}

	var forEach = function (arr, fn) {
		if (Object.prototype.toString.call(arr) !== "[object Array]" ) {
			return "First argument are expected to be an Array"
		}
		for (var i = 0, len = arr.length; i < len; i++) {
			fn(i, arr[i], arr);
		}
	}

	var log = function (msg) {
		if (query("h1") && typeof msg === "string") {
			query("h1").innerHTML = msg;
		}
	}

	var show = function (ele) {
		ele.style.display = "inline-block";
	}

	var cvs = document.createElement("canvas");
	var ctx = cvs.getContext("2d");

	var image = query(config.image);

	var uploader = document.createElement("input");
		uploader.type = "file";
	var file,
		originalData;

	uploader.onchange = upload;

	query(config.upload).onclick = function () {
		uploader.click();
	}

	function upload() {
		file = uploader.files[0];
		if (!file) {
			log("请上传一张图片");
			return;
		}
		if (/^image\/png|jpeg|gif|bmp$/.test(file.type)) {
			log("图片：" + file.name + "<br>大小：" + _fixSize(file.size));
			var fileReader = new FileReader();
			fileReader.readAsDataURL(file);
			fileReader.onload = function () {
				var temp = new Image();
				originalData = temp.src = this.result;
				temp.onload = function () {
					cvs.width = temp.width;
					cvs.height = temp.height;
					query(config.fontSize).value = parseInt(temp.width/20+10);
					query(config.margin).value = parseInt(temp.width/50+10);
					show(query(config.rotate));
					show(query(config.create));
					show(query(config.download));
					create();
				}
			}
		} else {
			log("你上传的不是图片，请上传一张图片");
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
		if (!file) return;
		var temp = new Image();
		temp.src = originalData;
		temp.onload = function () {
			ctx.drawImage(temp, 0, 0);
			var fontSize = _fixNum(query(config.fontSize), parseInt(cvs.width/20+10));
			var fontFamily = query(config.fontFamily).value;
			var color = query(config.color).value;
			var position = getPosition(query(config.position).value);
			ctx.font = fontSize + "px " + fontFamily;
			ctx.fillStyle = color;
			ctx.textAlign = position.align;
			ctx.textBaseline = position.baseline;
			ctx.fillText(query(config.text).value || "", position.x, position.y);
			image.src = cvs.toDataURL(file.type);
			image.style.width = temp.width > container.offsetWidth ? "100%" : "";
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
		if (!file) return;
		var temp = new Image();
		temp.src = originalData;
		temp.onload = function () {
			var x = cvs.width;
			var y = cvs.height;
			ctx.drawImage(temp, 0, 0);
			var tempData = ctx.getImageData(0, 0, x, y);
			var beforeRotate = [];
			for (var i = 0; i < x; i++) {
				beforeRotate[i] = [];
				/*for (var j = 0; j < y; j++) {
					beforeRotate[i][j] = 0;
				}*/
			}
			var afterRotate = [];
			for (var i = 0; i < y; i++) {
				afterRotate[i] = [];
				/*for (var j = 0; j < x; j++) {
					afterRotate[i][j] = 0;
				}*/
			}
			for (var i = 0, len = tempData.data.length; i < len; i+=4) {
				beforeRotate[i/4%x][Math.floor(i/4/x)] = [
					tempData.data[i],
					tempData.data[i+1],
					tempData.data[i+2],
					tempData.data[i+3]
				];
			}
			for (var i = 0; i < x; i++) {
				for (var j = 0; j < y; j++) {
					afterRotate[y-j-1][i] = beforeRotate[i][j];
				}
			}
			cvs.width = y;
			cvs.height = x;
			tempData = ctx.getImageData(0, 0, y, x);
			for (var i = 0, len = tempData.data.length; i < len; i+=4) {
				tempData.data[i] = afterRotate[i/4%y][Math.floor(i/4/y)][0];
				tempData.data[i+1] = afterRotate[i/4%y][Math.floor(i/4/y)][1]; 
				tempData.data[i+2] = afterRotate[i/4%y][Math.floor(i/4/y)][2];
				tempData.data[i+3] = afterRotate[i/4%y][Math.floor(i/4/y)][3];
			}
			ctx.putImageData(tempData, 0, 0);
			originalData = cvs.toDataURL(file.type);
			create();
		}
	}

	query(config.download).onclick = function () {
		if (!file) return;
		open(cvs.toDataURL(query(config.format).value));
		/*var type = query(config.format).value;
		var name = _fixName(file.name) + _timestamp() + "." + type;
		type = _fixType(type);
		var imageData = cvs.toDataURL(type).replace(type,"image/octet-stream");
		var link = document.createElement("a");
		link.href = imageData;
		link.download = name;
		link.click();*/
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
		var margin = _fixNum(query(config.margin), parseInt(cvs.width/50+10));
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
				x : cvs.width/2,
				y : 5
			},
			righttop : {
				align : "right",
				baseline : "top",
				x : cvs.width-margin,
				y : margin
			},
			leftmiddle : {
				align : "left",
				baseline : "middle",
				x : margin,
				y : cvs.height/2
			},
			centermiddle : {
				align : "center",
				baseline : "middle",
				x : cvs.width/2,
				y : cvs.height/2
			},
			rightmiddle : {
				align : "right",
				baseline : "middle",
				x : cvs.width-margin,
				y : cvs.height/2
			},
			leftbottom : {
				align : "left",
				baseline : "bottom",
				x : margin,
				y : cvs.height-margin
			},
			centerbottom : {
				align : "center",
				baseline : "bottom",
				x : cvs.width/2,
				y : cvs.height-margin
			},
			rightbottom : {
				align : "right",
				baseline : "bottom",
				x : cvs.width-margin,
				y : cvs.height-margin
			}
		}[position];
	}

	// global.watermark = config;

// })(window);