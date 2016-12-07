var socket = io();
var vm = new Vue({
	el: '#app',
	data: {
		pages: {},
	referrers: {},
	activateUsers: 0
},
created: function(){
	socket.io('updated-stats', function(data) {
		this.pages = data.pages;
		this.referrers = data.referrers;
		this.activateUsers = data.activateUsers;
	}.bind(this));
}
});