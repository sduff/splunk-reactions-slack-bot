const http = require('http');
const Fuse = require('fuse.js')
const request = require('request')

require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();


var reactions = require("./../reactions.js").reactions;
                   
var options = {
  shouldSort: true,
  tokenize: true,
  matchAllTokens: true,
  threshold: 0.3,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 2,
  keys: [
    "text"
  ]
};

var fuse = new Fuse(reactions, options);

// since x-www-form-urlencoded is used for request body
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/splunkreaction", (req, res, done) => { 
    console.log('Got a /splunkreaction post', req);

    let token = req.body && req.body.token;
    
    var result = fuse.search(req.body.text.trim());

    var select_result = "";
  
    if(result.length==0 || req.body.text == "") {
      // random
      select_result = reactions[Math.floor(Math.random() * reactions.length)];
      select_result.text = "(Random Reaction) "+ select_result.text;
    } else {
      // choose from top results
      select_result = result[Math.floor(Math.random() * result.length)];
    }
    
    console.log(select_result);
  
    res.send({
      "response_type": "in_channel",

      "attachments": [
        {
          "title": select_result.text,
          "title_link": select_result.url,
          "fallback": "Imagine a funny, yet relevant, image here",
          "image_url": select_result.image_url
        }
      ]
    });
    
});

app.get("/keepalive", (req,res,done) => {
  console.log(Date.now() + " Received Keep Alive");
});

app.get('/auth', (req, res) =>{
    res.sendFile(__dirname + '/add_to_slack.html')
});

app.get('/auth/redirect', (req, res) =>{
    var options = {
        uri: 'https://slack.com/api/oauth.access?code='
            +req.query.code+
            '&client_id='+process.env.CLIENT_ID+
            '&client_secret='+process.env.CLIENT_SECRET+
            '&redirect_uri='+process.env.REDIRECT_URI,
        method: 'GET'
    }
    request(options, (error, response, body) => {
        var JSONresponse = JSON.parse(body)
        if (!JSONresponse.ok){
            console.log(JSONresponse)
            res.send("Error encountered: \n"+JSON.stringify(JSONresponse)).status(200).end()
        }else{
            console.log(JSONresponse)
            res.send("Success!")
        }
    })
});


const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/keepalive`);
}, 280000);