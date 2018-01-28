app = new Vue({
	el: '#app',
	data: {
		text: null,
		enurl: null,
		showtg: false,// is show the tugong ICON
		tgstyle: [],
		// 解析GUID需要的正则
		guidregEx: /[?a-zA-Z0-9]{8}-[?a-zA-Z0-9]{4}-[?a-zA-Z0-9]{4}-[?a-zA-Z0-9]{4}-[?a-zA-Z0-9]{12}/,
	},
	watch: {
		showtg: function(status) {
			status ? this.tgstyle = ['show'] : this.tgstyle = [];
			if (status) {
				setTimeout(function() {
					app.showtg = false;// 显示2秒自动关闭
				}, 2700);
			}
		}
	},
	methods: {
		getTempURL: function() {
			axios.post('/api/get-temp', {
				text: app.text
			}).then(function(response) {
				var data = response.data;
				if (data.status == 1) {
					var newURL = window.location.protocol + "//" + window.location.host + window.location.pathname;
					app.enurl = newURL + data.guid;
				} else {
					throw 'failure to get the tmp url!';
				}
				console.log(response);
			}).catch(function(error) {
				console.warn(error);
			})
		}
	}
})