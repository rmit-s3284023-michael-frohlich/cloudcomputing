var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var request = require('request');
var async = require('async');
const path = require('path');
var MongoClient = require('mongodb').MongoClient

var mongoURL = "mongodb://ec2-13-56-255-76.us-west-1.compute.amazonaws.com:27017/leaguedb";

app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'handlebars');

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/searchdb', function(req, res) {
  MongoClient.connect(mongoURL, function(err, db) {
    if (err) throw err;
    db.collection("summoners").findOne({ name: req.query.summoner}, function(err, result) {
      if (err) throw err;
      res.render('index', {
        info: result
      });
      console.log(result);
      db.close();
    });
  });
});

app.get('/search', function(req, res) {
  var data = {};
  var apiKey = 'RGAPI-a07b4d71-22b9-43d5-9e45-53cc80dbeec6';
  var search = req.query.summoner.toLowerCase();

  async.waterfall([
      function(callback) {
        var URL = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + search + '?api_key=' + apiKey;
        request(URL, function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var json = JSON.parse(body);
            data.accountId = json.accountId;
            data.name = json.name;
            callback(null, data);
          } else {
            console.log(err);
            var json = JSON.parse(body);
            data.error = "Error. Please try again";
            callback(null, data);
          }
        });
      },
      function(data, callback) {
        var URL = 'https://na1.api.riotgames.com/lol/match/v3/matchlists/by-account/' + data.accountId + '/recent?api_key=' + apiKey;
        request(URL, function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var json = JSON.parse(body);
            var champs = [];
            for (var c = 0; c < json['matches'].length; c++) {
              data.championId = json['matches'][0].champion;
              data.championId1 = json['matches'][1].champion;
              data.championId2 = json['matches'][2].champion;
              data.championId3 = json['matches'][3].champion;
              data.championId4 = json['matches'][4].champion;
              data.championLane = json['matches'][0].lane;
              data.championLane1 = json['matches'][1].lane;
              data.championLane2 = json['matches'][2].lane;
              data.championLane3 = json['matches'][3].lane;
              data.championLane4 = json['matches'][4].lane;
            }
            callback(null, data);
          } else {
            console.log(err);
            var json = JSON.parse(body);
            data.error = "Error. Please try again";
            callback(null, data);
          }
        });
      },
      function(data, callback) {
        var URL = 'https://na1.api.riotgames.com/lol/static-data/v3/champions/' + data.championId + '?locale=en_US&tags=info&api_key=' + apiKey;
        request(URL, function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var json = JSON.parse(body);
            data.championName = json.name;
            data.championKey = json.key;
            callback(null, data);
          } else {
            console.log(err);
            var json = JSON.parse(body);
            data.error = "Error. Please try again";
            callback(null, data);
          }
        });
      },
      function(data, callback) {
        var URL = 'https://na1.api.riotgames.com/lol/static-data/v3/champions/' + data.championId1 + '?locale=en_US&tags=info&api_key=' + apiKey;
        request(URL, function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var json = JSON.parse(body);
            data.championName1 = json.name;
            data.championKey1 = json.key;
            callback(null, data);
          } else {
            console.log(err);
            var json = JSON.parse(body);
            data.error = "Error. Please try again";
            callback(null, data);
          }
        });
      },
      function(data, callback) {
        var URL = 'https://na1.api.riotgames.com/lol/static-data/v3/champions/' + data.championId2 + '?locale=en_US&tags=info&api_key=' + apiKey;
        request(URL, function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var json = JSON.parse(body);
            data.championName2 = json.name;
            data.championKey2 = json.key;
            callback(null, data);
          } else {
            console.log(err);
            var json = JSON.parse(body);
            data.error = "Error. Please try again";
            callback(null, data);
          }
        });
      },
      function(data, callback) {
        var URL = 'https://na1.api.riotgames.com/lol/static-data/v3/champions/' + data.championId3 + '?locale=en_US&tags=info&api_key=' + apiKey;
        request(URL, function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var json = JSON.parse(body);
            data.championName3 = json.name;
            data.championKey3 = json.key;
            callback(null, data);
          } else {
            console.log(err);
            var json = JSON.parse(body);
            data.error = "Error. Please try again";
            callback(null, data);
          }
        });
      },
      function(data, callback) {
        var URL = 'https://na1.api.riotgames.com/lol/static-data/v3/champions/' + data.championId4 + '?locale=en_US&tags=info&api_key=' + apiKey;
        request(URL, function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var json = JSON.parse(body);
            data.championName4 = json.name;
            data.championKey4 = json.key;
            callback(null, data);
          } else {
            console.log(err);
            var json = JSON.parse(body);
            data.error = "Error. Please try again";
            callback(null, data);
          }
        });
      }
    ],
    function(err, data) {
      if (err) {
        console.log(err);
        return;
      }
      MongoClient.connect(mongoURL, function(err, db) {
        if (err) throw err;
        db.createCollection("summoners", function(err, res) {
          if (err) throw err;
          console.log("Collection created!");
          //db.close();
        });
        db.collection("summoners").update(data, data, {upsert : true}, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
        });
      });
      console.log(data);
      res.render('index', {
        info: data
      });
    });
});

app.get('/compare', function(req, res) {
  var data = {};
  var apiKey = 'RGAPI-a07b4d71-22b9-43d5-9e45-53cc80dbeec6';
  var search = req.query.summoner1.toLowerCase();
  var search2 = req.query.summoner2.toLowerCase();

  async.waterfall([
      function(callback) {
        var URL = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + search + '?api_key=' + apiKey;
        request(URL, function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var json = JSON.parse(body);
            data.accountId = json.accountId;
            data.name = json.name;
            callback(null, data);
          } else {
            console.log(err);
            var json = JSON.parse(body);
            data.error = "Error. Please try again";
            callback(null, data);
          }
        });
      },
      function(data, callback) {
        var URL = 'https://na1.api.riotgames.com/lol/match/v3/matchlists/by-account/' + data.accountId + '/recent?api_key=' + apiKey;
        request(URL, function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var json = JSON.parse(body);
            var champs = [];
            for (var c = 0; c < json['matches'].length; c++) {
              data.championId = json['matches'][0].champion;
              data.championId1 = json['matches'][1].champion;
              data.championId2 = json['matches'][2].champion;
              data.championLane = json['matches'][0].lane;
              data.championLane1 = json['matches'][1].lane;
              data.championLane2 = json['matches'][2].lane;
            }
            callback(null, data);
          } else {
            console.log(err);
            var json = JSON.parse(body);
            data.error = "Error. Please try again";
            callback(null, data);
          }
        });
      },
      function(data, callback) {
        var URL = 'https://na1.api.riotgames.com/lol/static-data/v3/champions/' + data.championId + '?locale=en_US&tags=info&api_key=' + apiKey;
        request(URL, function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var json = JSON.parse(body);
            data.championName = json.name;
            data.championKey = json.key;
            callback(null, data);
          } else {
            console.log(err);
            var json = JSON.parse(body);
            data.error = "Error. Please try again";
            callback(null, data);
          }
        });
      },
      function(data, callback) {
        var URL = 'https://na1.api.riotgames.com/lol/static-data/v3/champions/' + data.championId1 + '?locale=en_US&tags=info&api_key=' + apiKey;
        request(URL, function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var json = JSON.parse(body);
            data.championName1 = json.name;
            data.championKey1 = json.key;
            callback(null, data);
          } else {
            console.log(err);
            var json = JSON.parse(body);
            data.error = "Error. Please try again";
            callback(null, data);
          }
        });
      },
      function(data, callback) {
        var URL = 'https://na1.api.riotgames.com/lol/static-data/v3/champions/' + data.championId2 + '?locale=en_US&tags=info&api_key=' + apiKey;
        request(URL, function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var json = JSON.parse(body);
            data.championName2 = json.name;
            data.championKey2 = json.key;
            callback(null, data);
          } else {
            console.log(err);
            var json = JSON.parse(body);
            data.error = "Error. Please try again";
            callback(null, data);
          }
        });
      },
      function(data, callback) {
        var URL = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + search2 + '?api_key=' + apiKey;
        request(URL, function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var json = JSON.parse(body);
            data.account2Id = json.accountId;
            data.name2 = json.name;
            callback(null, data);
          } else {
            console.log(err);
            var json = JSON.parse(body);
            data.error = "Error. Please try again";
            callback(null, data);
          }
        });
      },
      function(data, callback) {
        var URL = 'https://na1.api.riotgames.com/lol/match/v3/matchlists/by-account/' + data.account2Id + '/recent?api_key=' + apiKey;
        request(URL, function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var json = JSON.parse(body);
            var champs = [];
            for (var c = 0; c < json['matches'].length; c++) {
              data.champion2Id = json['matches'][0].champion;
              data.champion2Id1 = json['matches'][1].champion;
              data.champion2Id2 = json['matches'][2].champion;
              data.champion2Lane = json['matches'][0].lane;
              data.champion2Lane1 = json['matches'][1].lane;
              data.champion2Lane2 = json['matches'][2].lane;
            }
            callback(null, data);
          } else {
            console.log(err);
            var json = JSON.parse(body);
            data.error = "Error. Please try again";
            callback(null, data);
          }
        });
      },
      function(data, callback) {
        var URL = 'https://na1.api.riotgames.com/lol/static-data/v3/champions/' + data.champion2Id + '?locale=en_US&tags=info&api_key=' + apiKey;
        request(URL, function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var json = JSON.parse(body);
            data.champion2Name = json.name;
            data.champion2Key = json.key;
            callback(null, data);
          } else {
            console.log(err);
            var json = JSON.parse(body);
            data.error = "Error. Please try again";
            callback(null, data);
          }
        });
      },
      function(data, callback) {
        var URL = 'https://na1.api.riotgames.com/lol/static-data/v3/champions/' + data.champion2Id1 + '?locale=en_US&tags=info&api_key=' + apiKey;
        request(URL, function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var json = JSON.parse(body);
            data.champion2Name1 = json.name;
            data.champion2Key1 = json.key;
            callback(null, data);
          } else {
            console.log(err);
            var json = JSON.parse(body);
            data.error = "Error. Please try again";
            callback(null, data);
          }
        });
      },
      function(data, callback) {
        var URL = 'https://na1.api.riotgames.com/lol/static-data/v3/champions/' + data.champion2Id2 + '?locale=en_US&tags=info&api_key=' + apiKey;
        request(URL, function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var json = JSON.parse(body);
            data.champion2Name2 = json.name;
            data.champion2Key2 = json.key;
            callback(null, data);
          } else {
            console.log(err);
            var json = JSON.parse(body);
            data.error = "Error. Please try again";
            callback(null, data);
          }
        });
      }
    ],
    function(err, data) {
      if (err) {
        console.log(err);
        return;
      }
      console.log(data);
      res.render('compare', {
        info: data
      });
    });
});

var port = Number(process.env.PORT || 3000);
app.listen(port);
