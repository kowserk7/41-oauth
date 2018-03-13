'use strict';
const errorHandler = require('./error-handler');
const Auth = require('../model/auth');
const jsonWebToken = require('jsonwebtoken');

const ERROR_MESSAGE = 'Authorization Failed';

module.exports = function(request, response, next) {
  let authHeader = request.headers.authorization;
  if(!authHeader) return errorHandler(new Error(ERROR_MESSAGE), response);
  let token = authHeader.split('Bearer ')[1];
  if(!token) return errorHandler(new Error(ERROR_MESSAGE), response);
  return jsonWebToken.verify(token, process.env.APP_SECRET, (err, decodedValue) => {
    if(err) {
      err.message =ERROR_MESSAGE;
      return errorHandler(err, response);
    }
    return Auth.findOne({compareHash: decodedValue.token})
      .then(user => {
        if(!user) return errorHandler(new Error(ERROR_MESSAGE), response);
        request.user = user;
        next();
      })
      .catch(err => errorHandler(err, response));
  });
};