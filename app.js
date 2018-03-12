var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/views/';
app.use(express.static('views/assets'));


var jsforce = require('jsforce');
var conn = new jsforce.Connection({
});

router.get("/",function(req,res){
  res.sendFile(path + "index.html");
});

//REMOVE: hack for PW staging environment
router.get("/sidebar",function(req,res){
  res.sendFile(path + "index.html");
});

router.get("/sfdcinfo", function(req, res){
	console.log('in sfdcinfo');
	conn.login('brett@pw.com', 'Salesforce1wIpd13kf8wDWMfbEMi7CA4bS', function(err, userInfo) {
	  	if (err) { return console.error(err); }
		var records = [];
		var custEmail = req.query.email;

		console.log("Customer Email: " + custEmail);

		conn.sobject("Contact")
			.find({email : custEmail}, '*')
			.include("Cases") 
				.select("*")
				.orderby("CreatedDate", "DESC")
				.end() 
			.execute(function(err, r) {
				if (err) { return console.error(err); }
				res.send(r);
		});
	});
});

app.use("/",router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

app.listen(8080,function(){
  console.log("Live at Port 8080");
});
