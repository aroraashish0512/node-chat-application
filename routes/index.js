var express = require('express');
var router = express.Router();
/* var http = require('http').Server(express()); */


/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("Unathorized Access");
  //res.render('index', { title: 'Express' });
});

/* http.listen(4645, function(){
  console.log('listening on *:4645');
}); */

module.exports = router;
