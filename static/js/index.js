var $ = require('./assets/js/jquery.min.js');
var fs = require('fs');
var xlsx = null, curfile = null, workbookBook = null, workbookTel = null, nodeXlsx = null, filesObj = null;
//输出文件数组
var outputArr = [], titles = [];
//目标文件存储路径
var filePath = __dirname + '/output.xlsx';

if(typeof require !== 'undefined') {
	xlsx = require('xlsx');
	nodeXlsx = require('node-xlsx');
}

document.addEventListener("drop", function (event) {
	//阻止默认行为
	event.stopPropagation();
	event.preventDefault();
	filesObj = event.dataTransfer.files;
}, false);

document.addEventListener("dragover", function (event) {
	//阻止默认行为
	event.stopPropagation();
	event.preventDefault();
}, false);

$('body').on("click", "#button", function () {
	if (filesObj !== null) {
		$('#mask').show();
		$(this).val("处理中").attr("disabled", "disabled");
		getFilesPath(filesObj);
	} else {
		alert("请先导入文件");
		return;
	}
});

var getFilesPath = function (files) {
	var length = files.length,
		pathObj = {},
		fileName = "",
		i = 0;
	if (!files || length < 1 || length > 2) {
		alert("请同时导入两个文件!");
		$('#mask').fadeOut();
		$('#button').val("开始处理").removeAttr("disabled");
		return;
	}
	for (i = 0; i < length; i++) {
		fileName = files[i].path;
		if (fileName.indexOf("book") >= 0) {
			pathObj.book = fileName;
		} else if (fileName.indexOf('telephone') >= 0) {
			pathObj.tel = fileName;
		}
	}

	if (pathObj.hasOwnProperty("book") && pathObj.hasOwnProperty("tel")) {
		outputArr = [];
		title = [];
		dealWithExcel(files);
	} else {
		alert("文件添加错误!");
		$('#mask').fadeOut();
		$('#button').val("开始处理").removeAttr("disabled");
		return;
	}
}

var dealWithExcel = function (files) {
	if (xlsx === null) {
		$('#mask').fadeOut();
		return;
	}

	var slice = Array.prototype.slice;
	var queue = slice.call(files);
	var reader = new FileReader(),
		length = files.length;
		
	reader.onload = function (e) {
		var data = e.target.result;
		if (curfile.name.indexOf("book") >= 0) {
			workbookBook = xlsx.read(data, {type: 'binary'});
		} else {
			workbookTel = xlsx.read(data, {type: 'binary'});
		}

		if (queue.length > 0) {
			curfile = queue.shift();
			reader.readAsBinaryString(curfile);
		}
		
		if (workbookBook !== null && workbookTel !== null) {
			dealWithWorksheet();
		}
	}
	curfile = queue.shift();
	reader.readAsBinaryString(curfile);
}

var dealWithWorksheet = function () {
	var sheetBookNameList = workbookBook.SheetNames,
		sheetTelNameList = workbookTel.SheetNames,
		worksheetBook = workbookBook.Sheets[sheetBookNameList[0]],
		worksheetTel = workbookTel.Sheets[sheetTelNameList[0]],
		jsonBook = xlsx.utils.sheet_to_json(worksheetBook),
		jsonTel = xlsx.utils.sheet_to_json(worksheetTel);
		
	var targetName = "签约手机号/鉴权工具手机号";
	var bookLength = jsonBook.length,
		telLength = jsonTel.length,
		targrtTel = "",
		targetBook = "",
		i = 0,
		j = 0;
	for(k in jsonBook[0]) {
		if (k !== "__rowNum__") {
			titles.push(k);
		}
	}
	outputArr.push(titles);

	for (var j = 0; j < bookLength; j++) {
		targetBook = jsonBook[j];
		for (var i = 0; i < telLength; i++) {
			targrt = jsonTel[i][targetName];
			var bookArr = [];
			if (targetBook[targetName].indexOf(targrt) >= 0) {
				for (p in targetBook) {
					if (p !== "__rowNum__") {
						bookArr.push(targetBook[p]);
					}
				}
				outputArr.push(bookArr);
			}
		}
	}
	//输出目标文件
	writeWorkbook();
}

var writeWorkbook = function () {
	var buffer = nodeXlsx.build([{name: "output", data: outputArr}]); // returns a buffer 
	fs.writeFileSync(filePath, buffer, 'binary');
	$('#mask').fadeOut();
	$('#button').val("开始处理").removeAttr("disabled");
	setTimeout(function () {
		alert("处理完毕,文件已成功导出!");
	}, 500);
}

