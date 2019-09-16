const http = require('http');
const request = require('request')
const fs = require('fs')

require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

function log(msg) {
  var now = new Date().toISOString()
  fs.appendFileSync('.data/usage.log', `${now} ${msg}\n`)
}

log("Slack Bot is starting")

var reactions = require("./../reactions.js").reactions;

// add words from the text of the reaction to any tags
reactions.forEach( function(r) {
  var t = r.text + r.tags
  var new_tags = (t)
                .replace(/[.,?!;()"'-]/g, " ")
                .replace(/\s+/g, " ")
                .toLowerCase()
                .trim()
                .split(" ")
                .filter(function(v,i,self) {return self.indexOf(v) === i});
  r.tags = new_tags
})

// since x-www-form-urlencoded is used for request body
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/splunkreaction", (req, res, done) => { 
    console.log('Got a /splunkreaction post', req);

    let token = req.body && req.body.token; 
  
    // go through each reaction and find the best matches
    var search_terms = (req.body.text)
                .replace(/[.,?!;()"'-]/g, " ")
                .replace(/\s+/g, " ")
                .toLowerCase()
                .trim()
                .split(" ")
                .filter(function(v,i,self) {return self.indexOf(v) === i});

    var result = reactions.filter( function (e) {
      for (var word of search_terms) {
        if (e.tags.indexOf(word) == -1) {
          return false;
        }
      }
      return true;
    })
      
    var select_result = "", footer = "";
    if(result.length==0 || req.body.text == "") {
      // random
      select_result = reactions[Math.floor(Math.random() * reactions.length)];
      select_result.text = "(Random Reaction) "+ select_result.text;
      footer = search_terms.join(' ') + " _(0)_ "+select_result.url
    } else {
      // choose from top results
      select_result = result[Math.floor(Math.random() * result.length)];
      footer = search_terms.join(' ') + " _(1/"+result.length+")_ "+select_result.url
    }
    
    console.log(req);
  
    log(`${req.body.user_name} in ${req.body.channel_name} on ${req.body.team_domain} said "${req.body.text}". I returned ${footer}`)
  
    res.send({
      "response_type": "in_channel",

      "attachments": [
        {
          "title": select_result.text,
          "title_link": select_result.url,
          "fallback": "Imagine a funny, yet relevant, image here",
          "image_url": select_result.image_url,
          "footer": footer
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