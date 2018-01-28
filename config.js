/**
 * naiveboom配置文件
 * @type {Object}
 */
module.exports = {
	// redis服务器配置
	redis_host: '127.0.0.1',
	redis_port: '6379',
	redis_pwd: null, // 没有redis密码则写 null
	// 列表Hash表名
	field_lists: 'naives',
	// 列表的的消费次数Hash表名
	field_lists_count: 'naives_count',
	limit_max: 2,// (仅机器人) 可能的最大查看次数
	// 匹配GUID的正则表达式
	regex_guid: /[?a-zA-Z0-9]{8}-[?a-zA-Z0-9]{4}-[?a-zA-Z0-9]{4}-[?a-zA-Z0-9]{4}-[?a-zA-Z0-9]{12}/,
}
