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

function requireHTTPS(req, res, next) {
  // The 'x-forwarded-proto' check is for Heroku
  if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV == "production") {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}

app.use(requireHTTPS);


app.get('/', (req, res, next) => {
	const { q, raw } = req.query;
	if (q){
		var q_array=q.toLowerCase().split(" ");
		q_array.sort();
		var q_cache=q_array.join(" ");
		client.get(q_cache,function(err,reply){
			if (reply){
				reply=JSON.parse(reply)
				reply.q=q;
				console.log(reply.q);
				res.render("results",reply);
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
						gres.data.q=q;
						console.log(gres.data.q);
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

