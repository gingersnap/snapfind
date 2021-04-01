const { google } = require('googleapis');
const customsearch = google.customsearch('v1');

const express = require('express')
const app = express();
var exphbs  = require('express-handlebars');
const expresslocale = require('express-locale')
const port = process.env.PORT || 8080;

var cache=[];
app.use(express.static('public'))
app.use(expresslocale());

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', (req, res, next) => {
	const { q, raw } = req.query;
	if (q){
		if (cache[q.toLowerCase()]){
			res.render("results",cache[q.toLowerCase()]);
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
					cache[q.toLowerCase()]=gres.data;
					console.log("Unique");
				}
			});
		};
	}else{
		res.render("home");
	}

});

app.listen(port, function(){console.log("Listening on port:"+port)});
console.log(process.env.google_auth);
