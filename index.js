require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const cors = require('cors')
const KJUR = require('jsrsasign')
const request = require('request')
const rp = require('request-promise');
const jwt = require('jsonwebtoken'); 
const Zoom = require("node-zoom-jwt")
const payload = { iss: 'WRiUXZskRlGnNqsROjzfpw', exp: ((new Date()).getTime() + 5000) }; 
let zoomAccessToken = jwt.sign(payload, 'xznQ4B0U2ZvxZdHVyJpKKvQ3AzC2JsKf');
let tempZoomToken = '';
 Zoom.connect(
  'WRiUXZskRlGnNqsROjzfpw',
  'xznQ4B0U2ZvxZdHVyJpKKvQ3AzC2JsKf',
  new Date().getTime() + 5000
  );
const app = express()
const port = process.env.PORT || 4000

app.use(bodyParser.json(), cors())
app.options('*', cors())

app.post('/', (req, res) => {

  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2

  const oHeader = { alg: 'HS256', typ: 'JWT' }

  const oPayload = {
   // sdkKey: process.env.ZOOM_MEETING_SDK_KEY,
    sdkKey: "WRiUXZskRlGnNqsROjzfpw",
    mn: req.body.meetingNumber,
    role: req.body.role,
    iat: iat,
    exp: exp,
    //appKey: process.env.ZOOM_MEETING_SDK_KEY,
    appKey: "WRiUXZskRlGnNqsROjzfpw",
    tokenExp: iat + 60 * 60 * 2
  }

  const sHeader = JSON.stringify(oHeader)
  const sPayload = JSON.stringify(oPayload)
  const signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, "xznQ4B0U2ZvxZdHVyJpKKvQ3AzC2JsKf")

  res.json({
    signature: signature
  })
})

app.post('api/meeting', async (req, res) => {
  Zoom.connect(
    'WRiUXZskRlGnNqsROjzfpw',
    'xznQ4B0U2ZvxZdHVyJpKKvQ3AzC2JsKf',
    new Date().getTime() + 5000
    );
  const userID = req.body.userID;
  ///const meeting = await Zoom.meetingcreate('ntokozomweli001@gmail.com', req.body);
  //console.log(meeting);
  //console.log(tempZoomToken)
  
  var options = {
    //You can use a different uri if you're making an API call to a different Zoom endpoint.
    uri: 'https://api.zoom.us/v2/users/ntokozomweli001@gmail.com/meetings', 
    method: 'POST',
    auth: {
        'bearer': tempZoomToken
    },
    headers: {
        'content-type': 'application/json'
    },
    body: req.body,
    json: true //Parse the JSON string in the response
};
      let url =  'https://api.zoom.us/v2/users/ntokozomweli001@gmail.com/meetings';
      rp(options)
      .then(function (response) {
        //printing the response on the console
          console.log('User has', response);
          //console.log(typeof response);
          resp = response
          //JSON.stringify(resp, null, 2)
          res.send(JSON.stringify(resp, null, 2));
          //Adding html to the page
   
      })
      .catch(function (err) {
          // API call failed...
          console.log('API call failed, reason ', err);
      });
      
  
  // If no auth code is obtained, redirect to Zoom OAuth to do authentication
 // res.redirect('https://zoom.us/oauth/authorize?response_type=code&client_id=' + 'WRiUXZskRlGnNqsROjzfpw' + '&redirect_uri=' +'https://fcac-197-184-182-91.ngrok-free.app')
})

app.get('api/meeting',  (req, res) => {

})

app.get('api/',  (req, res) => {

})



app.get('/', (req, res) => {
  const authCode=req.query.code;
  if (authCode) {
      // Request an access token using the auth code
      let url =  'https://zoom.us/oauth/token?grant_type=authorization_code&code=' + authCode + '&redirect_uri=' + 'https://ae-zoom-api.onrender.com/api/loginzoom';
      request.post(url, (error, response, body) => {
          // Parse response to JSON
          body = JSON.parse(body);
          const accessToken = body.access_token;
          tempZoomToken = body.access_token;
          const refreshToken = body.refresh_token;
          // Obtained access and refresh tokens
          console.log(`Zoom OAuth Access Token: ${accessToken}`);
          console.log(`Zoom OAuth Refresh Token: ${refreshToken}`);
          
      }).auth('WRiUXZskRlGnNqsROjzfpw', 'xznQ4B0U2ZvxZdHVyJpKKvQ3AzC2JsKf');
      return ;
  }
  // If no auth code is obtained, redirect to Zoom OAuth to do authentication
  res.redirect('https://zoom.us/oauth/authorize?response_type=code&client_id=' + 'WRiUXZskRlGnNqsROjzfpw' + '&redirect_uri=' +'https://ae-zoom-api.onrender.com/api/loginzoom')
})


app.listen(port, () => console.log(`Zoom Meeting SDK Auth Endpoint Sample Node.js listening on port ${port}!`))
