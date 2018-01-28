var express = require('express');
var router = express.Router();
var conf = require('../config.js');
var mtool = new (require('../lib/tools.js'))(conf);// 消息操作工具

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Naiveboom - 比较安全' });
});

/**
 * 提取信息
 * @param  {[type]} req  [description]
 * @param  {[type]} res) {	var        guid [description]
 * @return {[type]}      [description]
 */
router.get(conf.regex_guid, function(req, res) {
	var guid = conf.regex_guid.exec(req.path)[0];
	var isSpider = mtool.isTelegramBot(req);// 判断是不是Telegram的蜘蛛
	mtool.exists(guid, (exists) => {
		var rep = {status: 0, title: '查看内容 - naiveBoom!', text: null};
		if (exists) {
			mtool.get(guid, (text) => {
				rep.status = 1; rep.text = text;
				mtool.tryDelete(guid, isSpider);// 尝试删除消息
				res.render('look', rep);
			});
		} else {
			res.render('look', rep);
		}
	});
})

module.exports = router;
