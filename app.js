const { google } = require('googleapis');
const customsearch = google.customsearch('v1');

const express = require('express')
const app = express();
var exphbs  = require('express-handlebars');
const expresslocale = require('express-locale')
const port = process.env.PORT || 8080;

const redis = require("redis");
//const fs = require("fs");

const client = redis.createClient(process.env.REDIS_URL, {
	tls: {
		rejectUnauthorized: false
	}
});


var cache=[];
app.use(express.static('public'))
app.use(expresslocale());

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', (req, res, next) => {
	const { q, raw } = req.query;
	if (q){
		var q_array=q.toLowerCase().split(" ");
		q_array.sort();
		var q_cache=q_array.join(" ");
		console.log(q_cache);
		client.get(q_cache,function(err,reply){
			if (reply){
				res.render("results",JSON.parse(reply));
				console.log("Cache");
			}else{
				var search_options={
					auth: process.env.google_auth,
					cx: process.env.google_cx,
					q:q,
					gl:req.locale.region,
					hl:req.locale.language
				};
				customsearch.cse.list(search_options,function(err,gres){
					if (err) {
						console.error(err);
						throw err;
					}
					if (raw){
						res.json(gres.data);

					}else{
						res.render("results",gres.data);
						client.set(q_cache, JSON.stringify(gres.data));
						console.log("Unique");
					}
				});
			};


		});


	}else{

		res.render("home");
	}

});

app.get('/flushredis', (req, res, next) => {
	client.flushall( function (err, succeeded) {
		res.send("Result of flushall "+succeeded)
	});

});
app.listen(port, function(){console.log("Listening on port:"+port)});

