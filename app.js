//require Express and socket.io
var express = require('express');
var app= express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var config = require('./config.js');
// the object that will hold information about the active users currently
// on the site

var visitorsData = {};

app.set('port', (process.env.PORT || 5000));

//server the static assets(js/dashboard.js and css/dashboard.css)
// from the public/directory

app.use(express.static(path.join(__dirname, 'public/')));

//serve the index.html page when some one visits any of the following endpoints
// 1. /
// 2. /about
// 3. /contact

app.get(/\/(about|contact)?$/, function(req,res){
	res.sendFile(path.join(__dirname, 'views/index.html'));	
});

// server up the dashboard when someone visits/dashboard
app.get('/dashboard', function(req,res) {
	res.sendFile(path.join(__dirname, 'views/dashboard.html'));

});

io.on('connection', function(socket) {
	if (socket.handshake.headers.host === config.host
	&& socket.handshake.headers.referer.indexOf(config.host + config.dashboardEndpoint) > -1) {

	// if some visits '/dashboard' send them the computed vistor data
io.emit('update-stats', computeStats());

}

/*
	io.emit('update-data',  {
		pages: computePageCounts(),
		referrers: computeRefererCounts(),
		getActiveUsers: getActiveUsers()
	});

	}
*/
	//a user has visited our page -  add then to the visitorsData object
	socket.on('visitor-data', function(data) {
		visitorsData[socket.id] = data;

		// compute and send visitors data to the dashboard when a new user visits our page
		io.emit('updated-stats', computeStats());
	});

socket.on('disconnect', function() {
	// a user has left our page-remove them form the visitorsData object
	delete visitorsData[socket.id];


	// compute and send visitor data to the dashboard when a user leave our page
	io.emit('updated-stats', computeStats());
	});
});

//wrapper function to compute the stat and return  a object with the updated stats

function computeStats(){
	return {
		pages: computePageCounts(),
		referrers: computeRefererCounts(),
		aactiveUsers: getActiveUsers()

	};
}
//get the total number of users on each page of your site
function computePageCounts () {
	//sample data in pageCounts object:
	// { "/": 13, "/about": 5 }

	var pageCounts = {};
	for (var key in visitorsData) {
		var page = visitorsData[key].page;
		if (page in pageCounts) {
			pageCounts[page]++;
		} else {
			pageCounts[page] = 1;
		}
	}
	return pageCounts;
}

// get the total number of user per referencing site

function computeRefererCounts() {
	// sample data in referrerCounts object:
	// { "http://twitter.com/": 3, "http://stackoverflow.com/":6}

	var referrerCounts = {};
	for(var key in visitorsData) {
		var referringSite = visitorsData[key].referringSite || '(direct)';
		if (referringSite in referrerCounts) {
			referrerCounts[referringSite]++;
		} else {
			referrerCounts[referringSite] = 1;
		}
	}
	return referrerCounts;
}
function getActiveUsers() {
	return Object.keys(visitorsData).length;
}
debugger;
http.listen(app.get('port'), function() {
	console.log('listening on *:' + app.get('port'));
});



