'use strict';

const Library = require('../model/library');
const bodyParser = require('body-parser').json();
const errorHandler = require('../lib/error-handler');
const bearerAuthMiddleware = require('../lib/bearer-auth-middleware');
const ERROR_MESSAGE = 'Authorization Failed';

module.exports = router => {
  router.route('/library/:id?')
    .post(bearerAuthMiddleware,bodyParser,(request,response) => {
      request.body.userId = request.user._id;
      return new Library(request.body).save()
        .then(newLibrary => response.status(201).json(newLibrary))
        .catch(err => errorHandler(err,response));
    })
    .get(bearerAuthMiddleware,(request,response) => {
      if(request.params.id){
        return Library.findById(request.params.id)
          .then(library => response.status(200).json(library))
          .catch(err => errorHandler(err,response));
      }
      return Library.find()
        .then(libraries => {
          let librariesIds = libraries.map(library => library.id);
          response.status(200).json(librariesIds);
        })
        .catch(err => errorHandler(err,response));
    })
    .put(bearerAuthMiddleware, bodyParser, (request,response) => {
      Library.findById(request.params.id,request.body)
        .then(library => {
          if(library.userId === request.user._id) {
            library.name = request.body.name || library.name;
            library.description = request.body.description || library.description;
            return library.save();
          }
          if (request.body.name === undefined || request.body.description === undefined ) {
            throw new Error('validation');
          }
          return new Error('validation');
        })
        .then(() => response.sendStatus(204))
        .catch(error => errorHandler(error,response));
    })

    .delete(bearerAuthMiddleware,(request,response) => {
      return Library.findById(request.params.id)
        .then(library => {
          if(library.userId.toString() === request.user.id.toString())
            return library.remove();
          return errorHandler(new Error(ERROR_MESSAGE),response);
        })
        .then(() => response.sendStatus(204))
        .catch(err => errorHandler(err,response));
    });
};