require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const cors = require('cors')
const KJUR = require('jsrsasign')
const request = require('request')
const axios = require('axios')
const rp = require('request-promise');
const jwt = require('jsonwebtoken'); 
const Zoom = require("node-zoom-jwt")
const payload = { iss: 'WRiUXZskRlGnNqsROjzfpw', exp: ((new Date()).getTime() + 5000) }; 
let zoomAccessToken = jwt.sign(payload, 'xznQ4B0U2ZvxZdHVyJpKKvQ3AzC2JsKf');
let tempZoomToken = '';
let currentUser = null;
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

app.get('api/:zoom_user_id/get_token', async (req, res) => {

  try {
    const decryptedToken = decrypt(currentUser?.access_token);

    return res.json({ access_token: decryptedToken });
  } catch (error) {
    return httpErrorHandler({
      error,
      res,
      customMessage: ZOOM_TOKEN_ERROR,
      logErrorPath: logHttpErrorPath(req),
    });
  }
});

app.post('/api/meeting', async (req, res) => {
  Zoom.connect(
    'WRiUXZskRlGnNqsROjzfpw',
    'xznQ4B0U2ZvxZdHVyJpKKvQ3AzC2JsKf',
    new Date().getTime() + 5000
    );
  const userID = req.body.userID;
  const userEmail = req.body.meetingBody.schedule_for;
  ///const meeting = await Zoom.meetingcreate('ntokozomweli001@gmail.com', req.body);
  //console.log(meeting);
  //console.log(tempZoomToken)
  console.log( req.body.token);
  //console.log(`Zoom OAuth Access Token: ${tempZoomToken}`);
  var options = {
    //You can use a different uri if you're making an API call to a different Zoom endpoint.
    uri: 'https://api.zoom.us/v2/users/me/meetings', 
    method: 'POST',
    auth: {
        'bearer': req.body.token
    },
    headers: {
        'content-type': 'application/json'
    },
    body: req.body.meetingBody,
    json: true //Parse the JSON string in the response
};
      let url =  'https://api.zoom.us/v2/users/me/meetings';
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

app.get('/api/meeting',  (req, res) => {
  res.send({ access_token: tempZoomToken });
})

app.get('/api/',  (req, res) => {

})



app.get('/', (req, res) => {
  const authCode=req.query.code;
  if (authCode) {
      // Request an access token using the auth code
      let url =  'https://zoom.us/oauth/token?grant_type=authorization_code&code=' + authCode + '&redirect_uri=' + 'https://ae-zoom-api.onrender.com/';
      request.post(url, async (error, response, body) => {
          // Parse response to JSON
          body = JSON.parse(body);
          const accessToken = body.access_token;
          tempZoomToken = body.access_token;
          const refreshToken = body.refresh_token;
          //res.send(JSON.stringify(tempZoomToken, null, 2));
          // Obtained access and refresh token
          console.log(`Zoom OAuth Access Token: ${accessToken}`);
          console.log(`Zoom OAuth Refresh Token: ${refreshToken}`);
          if(accessToken){
            res.send(`
                    <style>
                        @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600&display=swap');@import url('https://necolas.github.io/normalize.css/8.0.1/normalize.css');html {color: #232333;font-family: 'Open Sans', Helvetica, Arial, sans-serif;-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;}h2 {font-weight: 700;font-size: 24px;}h4 {font-weight: 600;font-size: 14px;}.container {margin: 24px auto;padding: 16px;max-width: 720px;}.info {display: flex;align-items: center;}.info>div>span, .info>div>p {font-weight: 400;font-size: 13px;color: #747487;line-height: 16px;}.info>div>span::before {content: "👋";}.info>div>h2 {padding: 8px 0 6px;margin: 0;}.info>div>p {padding: 0;margin: 0;}.info>img {background: #747487;height: 96px;width: 96px;border-radius: 31.68px;overflow: hidden;margin: 0 20px 0 0;}.response {margin: 32px 0;display: flex;flex-wrap: wrap;align-items: center;justify-content: space-between;}.response>a {text-decoration: none;color: #2D8CFF;font-size: 14px;}.response>pre {overflow-x: scroll;background: #f6f7f9;padding: 1.2em 1.4em;border-radius: 10.56px;width: 100%;box-sizing: border-box;}
                    </style>
                    <div class="container">
                        <div class="info">
                            <div>
                                <h2>You have successfully logged in.</h2>
                            </div>
                        </div>
                    </div>
                `);
          }
          
          //res.status(200).json(tempZoomToken);
          //res.json({accessToken: tempZoomToken});
          
      }).auth('g_Bv_Wc2Q2ehfdMrEz24JA', 'dAx85bs7yxnsD07FTTX2tJEzEb503Vu3');
      return tempZoomToken;
  }
  // If no auth code is obtained, redirect to Zoom OAuth to do authentication
  res.redirect('https://zoom.us/oauth/authorize?response_type=code&client_id=' + 'g_Bv_Wc2Q2ehfdMrEz24JA' + '&redirect_uri=' +'https://ae-zoom-api.onrender.com/')
})


app.listen(port, () => console.log(`Zoom Meeting SDK Auth Endpoint Sample Node.js listening on port ${port}!`))
