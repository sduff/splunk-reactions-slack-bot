const http = require('http');
const Fuse = require('fuse.js')

require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();


var reactions = [
    {
      "text":"splunk cloud",
      "tags":"cloud",
      "url":"http://google.com",
			"image_url": "https://media.giphy.com/media/L2O7BkpWfxDpdS8dSd/giphy.gif"
    },
    {
      "text":"pipeline",
      "tags":"",
      "url":"http://google.com",
			"image_url": "https://media.giphy.com/media/L2O7BkpWfxDpdS8dSd/giphy.gif"
    },
      {
      "text":"",
      "tags":"smoke",
      "url":"http://google.com",
			"image_url": "https://media.giphy.com/media/L2O7BkpWfxDpdS8dSd/giphy.gif"
    }
];
                            
var options = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    {name:"text", weight:0.7},
    {name:"tags", weight:0.3}
  ]
};

var fuse = new Fuse(reactions, options);

// since x-www-form-urlencoded is used for request body
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/react", (req, res, done) => { 
    console.log('Got a /react post', req);

    let token = req.body && req.body.token;
    
    var result = fuse.search(req.body.text);
    if(result.length>0) {
      result = result[0];
    } else {
      result = reactions[Math.floor(Math.random() * reactions.length)];
    }
    console.log(result);
    
    res.send({
      "response_type": "in_channel",
      "text": result.text,
      "attachments": [
        {
          "fallback": "Imagine a funny, yet relevant, image here",
          "image_url": result.image_url
        }
      ]
    });
    /*
    "text": "When you’ve finished a health check, and you’re about to tell the customer about your findings…",
    "attachments": [
        {
			"fallback": "Hilarious image goes here",
			"image_url": "https://media.giphy.com/media/L2O7BkpWfxDpdS8dSd/giphy.gif"
        }
    ]
}
  
    */
});

app.get("/keepalive", (req,res,done) => {
  console.log(Date.now() + " Received Keep Alive");
});


const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/keepalive`);
}, 280000);