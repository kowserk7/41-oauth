'use strict';

const faker = require('faker');
const mock = require('../../lib/mock');
const superagent = require('superagent');
const server = require('../../../lib/server');
const image = (`${__dirname}/headshot.jpg`);


describe('POST /api/v1/library', function() {
  beforeAll(server.start);
  beforeAll(() => mock.auth.createOne().then(data => this.mockAuth = data));
  afterAll(server.stop);
  afterAll(mock.auth.removeAll);
  afterAll(mock.library.removeAll);

  describe('Valid request', () => {
    it('should return a 201 CREATED status code', () => {
      let mockLibrary = null;
      return mock.library.createOne()
        .then(mock => {
          mockLibrary=mock;
          return superagent.post(`:${process.env.PORT}/api/v1/photo`)
            .set('Authorization', `Bearer ${mock.token}`)
            .field('name', faker.lorem.word())
            .field('desc', faker.lorem.words(5))
            .field('libraryId', `${mockLibrary.library._id}`)
            .attach('image', image);
        })
        .then(response => {
          expect(response.status).toEqual(201);
          expect(response.body).toHaveProperty('name');
          expect(response.body).toHaveProperty('desc');
          expect(response.body).toHaveProperty('_id');
        });
    });
  });

  describe('Invalid request', () => {
    it('should return a 401 error', () => {
      let mockLibrary = null;
      return mock.library.createOne()
        .then(mock => {
          mockLibrary=mock;
          return superagent.post(`:${process.env.PORT}/api/v1/photo`)
            .set('Authorization', 'Bearer BADTOKEN')
            .field('name', faker.lorem.word())
            .field('desc', faker.lorem.words(5))
            .field('libraryId', `${mockLibrary.library._id}`)
            .attach('image', image)
            .catch(err => expect(err.status).toEqual(401));
        });
    });
    it('should return a 404 error', () => {
      let mockLibrary = null;
      return mock.library.createOne()
        .then(mock => {
          mockLibrary=mock;
          return superagent.post(`:${process.env.PORT}/api/v1/images`)
            .set('Authorization', `Bearer ${mock.token}`)
            .field('name', faker.lorem.word())
            .field('desc', faker.lorem.words(5))
            .field('libraryId', `${mockLibrary.library._id}`)
            .attach('image', image);
        })
        .catch(err => expect(err.status).toEqual(404));
    });
  });
});