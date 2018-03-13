'use strict';

const express = require('express');
const superagent = require('superagent');

const app = express();

const GOOGLE_OAUTH_URL = 'https://www.googleapis.com/oauth2/v4/token';
const OPEN_ID_URL = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';

require('dotenv').config();

app.get('/oauth/google',(request,response) => {

  if(!request.query.code){
    response.redirect(process.env.CLIENT_URL);
  } else {
    console.log('__CODE__',request.query.code);
    return superagent.post(GOOGLE_OAUTH_URL)
      .type('form')
      .send({
        code: request.query.code,
        grant_type: 'authorization_code',
        client_id: process.env.GOOGLE_OAUTH_ID,
        client_secret: process.env.GOOGLE_OAUTH_SECRET,
        redirect_uri: `${process.env.API_URL}/oauth/google`,
      })
      .then(tokenResponse => {
        console.log('Step 3.2 - GOOGLE TOKEN');

        if(!tokenResponse.body.access_token)
          response.redirect(process.env.CLIENT_URL); 

        const token = tokenResponse.body.access_token;
        return superagent.get(OPEN_ID_URL)
          .set('Authorization', `Bearer ${token}`);
      })
      .then(openIDResponse => {
        console.log('Back from OpenID');
        console.log(openIDResponse.body);
        response.cookie('X-401d21-OAuth-Token','My Token!');
        response.redirect(process.env.CLIENT_URL); 
      })
      .catch(error => {
        console.log('__ERROR__',error.message);
        response.cookie('X-401d21-OAuth-Token','');
        response.redirect(process.env.CLIENT_URL + '?error=oauth'); 
      });
  }
});


app.listen(process.env.PORT, () => {
  console.log('__SERVER_UP__',process.env.PORT);
});