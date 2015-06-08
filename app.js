var bodyParser = require('body-parser');
var express = require('express');
var twilio = require('twilio');
var restler = require('restler');
var _ = require('lodash');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(8080, function() {
	console.log('Listening on port 8080');
});

app.post('/incoming', function(req, res) {
	var twiml = twilio.TwimlResponse();
	var query = req.body.Body.split(' ');
	var from = req.body.From;

	if (query[0].toLowerCase() === 'reddit')
	{
		var subreddit = query[1] || 'all';
		var limit = query[2] || 5;

		restler.get('http://www.reddit.com/r/' + subreddit + '/.json').on('complete', function(reddit) {
			var posts = _.take(reddit.data.children, limit);

			_.each(posts, function(post) {
				if (post.data.selftext) {
					twiml.message(post.data.title + '\n--------------\n' + post.data.selftext);
				}
				else {
					twiml.message(post.data.title);
				}
			});

			res.writeHead(200, { 'Content-Type': 'text/xml' });
			res.end(twiml.toString());
		});
	}
	else {
		twiml.message('Invalid query');
		res.writeHead(200, { 'Content-Type': 'text/xml' });
		res.end(twiml.toString());
	}

	console.log('Received query: ' + query + ' from: ' + from);
});