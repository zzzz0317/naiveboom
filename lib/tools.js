var redis = require("redis");
var guidtool = require('guid');

/**
 * Redis存档的Hash消息管理工具
 * @param  {Object} config  配置文件
 * @return {[type]}        [description]
 */
module.exports = function(conf)
{

	/**
	 * 初始化Redis连接
	 * @return {[type]} [description]
	 */
	var init = () => {
		this.conf = conf;
		// noderedis密码等选项
		var options = conf.redis_pwd ? { password: conf.redis_pwd } : null;
		// redis client instance
		this.client = redis.createClient(conf.redis_port, conf.redis_host, options);

		this.client.on("error", (err) => {
		    console.log("redis Error " + err);
		});
	}

	/**
	 * 删除Redis中的某条消息
	 * @param  {string}   guid     消息ID
	 * @param  {function} callback 回调函数 (status: 成功1，失败0)
	 * @return {[type]}            [description]
	 */
	this.delete = (guid, callback) => {
		// 删除计数器和实体
		this.client.hdel(this.conf.field_lists_count, guid);
		this.client.hdel(this.conf.field_lists, guid,(err, status) => {
			if (callback) {
				callback(status);
			}
		});
	}

	/**
	 * 获取一个不会重复的唯一ID
	 * @param  {Function} callback 回调函数，({ guid })
	 * @return {[type]}            [description]
	 */
	this.getUniID = (callback) => {
		var guid = guidtool.raw();
		this.exists(guid, (exists) => {
			// 如果存在则递归重新获取，直到获取到不重复的GUID并返回
			exists ? this.getUniID(callback) : callback(guid);
		});
	}

	/**
	 * 插入一条消息
	 * @param  {string}    text       欲被插入的内容
	 * @param  {integer}   limit      可空，最大被机器人访问次数，默认按配置文件{limit_max}项
	 * @param  {Function}  callback   回调函数，( status:1|0, guid:string )
	 * @example 回调函数 (status, guid) => { ... }
	 * 机器人消费次数指的是，TelegramBot Link Preview会触发阅后即焚
	 * 如果是机器人，则不销毁消息，默认最大是两次，超过两次无论如何都会销毁信息。
	 * @return {[type]}            [description]
	 */
	this.insert = (text, callback, limit = null) => {
		this.getUniID((guid) => {
			// 得到 最大机器人访问次数
			var limit = limit ? limit : conf.limit_max;
			// 存入消息
			this.client.hset(conf.field_lists, guid, text, (err, status) => {
				var _status, _guid = false;
				this.client.hset(conf.field_lists_count, guid, limit);// 存入可被机器人消费次数
				if (status) { _status = true; _guid = guid }
				callback(_status, _guid);
			});
		})
	}

	/**
	 * 检查是否存在某条消息
	 * @param  {string}   guid     消息ID
	 * @param  {Function} callback 回调函数 (status: 存在1，不存在0)
	 * @return {[type]}            [description]
	 */
	this.exists = (guid, callback) => {
		this.client.hexists(this.conf.field_lists, guid, (err, exists) => {
			callback(exists);
		});
	}

	/**
	 * 获取某条消息
	 * @param  {string}   guid     消息ID
	 * @param  {Function} callback 回调函数 (msg 消息内容)
	 * @return {[type]}            [description]
	 */
	this.get = (guid, callback) => {
		this.client.hget(this.conf.field_lists, guid, (err, msg) => {
			callback(msg);
		});
	}

	/**
	 * 是否是Telegram的spider
	 * Telegram Link Preview会导致触发阅后即焚
	 * @param  {Object} req  请求
	 * @return {bool} 是返回真，否则返回假
	 */
	this.isTelegramBot = (req) => {
		var ua = req.get('User-Agent');
		// 判断是不是Telegram的蜘蛛
		return ua.indexOf('TelegramBot') == 0 ? true : false;
	}

	/**
	 * 尝试去删除一条消息，会根据蜘蛛情况判断是否马上删除
	 * @param  {string}   guid     消息ID
	 * @param  {Boolean}  isSpider 是否是蜘蛛
	 * @param  {Function} callback 回调函数 (status: Deleted 1 or else 0)
	 * @return {[type]}            [description]
	 */
	this.tryDelete = (guid, isSpider = false, callback) => {
		// 如果不是蜘蛛则直接删除
		if (!isSpider) { return this.delete(guid, callback); }
		// 获取剩余消息消费次数
		this.client.hget(this.conf.field_lists_count, guid, (err, count) => {
			count = count ? count : 0;
			// 如果消息剩余消费次数用尽则删除消息，否则减少消费次数
			count <= 1 ? this.delete(guid, callback) : this.client.hset(this.conf.field_lists_count, guid, --count);
		});
	}

	// 初始化
	init();
}