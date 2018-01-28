var express = require('express');
var router = express.Router();
var conf = require('../config.js');
var mtool = new (require('../lib/tools.js'))(conf);// 消息操作工具

/* GET home page. */
router.post('/get-temp', function(req, res, next) {
	// 用户输出的内容
	var text = req.body.text;

	mtool.insert(text, (status, guid) => {
		rep = { status: status, guid: guid };
		res.send(rep);
	});
});

module.exports = router;
