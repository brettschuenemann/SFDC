var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/views/';
app.use(express.static('views/assets'));


var jsforce = require('jsforce');
var conn = new jsforce.Connection({
  // you can change loginUrl to connect to sandbox or prerelease env.
  // loginUrl : 'https://test.salesforce.com'
});

router.get("/",function(req,res){
  res.sendFile(path + "index.html");
});

router.get("/sfdcinfo", function(req, res){

	conn.login('brett@pw.com', 'Salesforce1wIpd13kf8wDWMfbEMi7CA4bS', function(err, userInfo) {
	  	if (err) { return console.error(err); }
	  // Now you can get the access token and instance URL information.
	  // Save them to establish connection next time.
		console.log(conn.accessToken);
		console.log(conn.instanceUrl);


		var records = [];
		var custEmail = req.query.email;

		console.log("Customer Email: " + custEmail);

		var query = conn.query("SELECT Id, Name FROM Contact WHERE email =" + "'" + custEmail + "'")
		  .on("record", function(record) {
		    records.push(record);
		  })
		  .on("end", function() {
		  		console.log('IN END');
		  		var r = [];
			    var q = conn.query("SELECT Id, CaseNumber, CreatedDate, Status, Subject, ContactId FROM Case WHERE ContactId =" + "'" + records[0].Id + "'")
					.on("record", function(record) {
						r.push(record);
					})
					.on("end", function() {
						console.log("total in database : " + q.totalSize);
						console.log("total fetched : " + q.totalFetched);
						res.send(r);
					})
					.on("error", function(err) {
						console.error(err);
					})
					.run({ autoFetch : true, maxFetch : 4000 });

		  })
		  .on("error", function(err) {
		    console.error(err);
		  })
		  .run({ autoFetch : true, maxFetch : 4000 });

	});
	});

app.use("/",router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

app.listen(8080,function(){
  console.log("Live at Port 8080");
});
