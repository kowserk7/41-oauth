
'use strict';

const faker = require('faker');
const mock = require('../../lib/mock');
const superagent = require('superagent');
const server = require('../../../lib/server');
require('jest');

describe('PUT /api/v1/library/:id?', function() {
  beforeAll(server.start);
  beforeAll(() => mock.auth.createOne().then(data => this.mockAuth = data));
  afterAll(server.stop);
  afterAll(mock.auth.removeAll);
  afterAll(mock.library.removeAll);

  describe('Valid request', () => {
    it('should return a 200 status code', () => {
      let mockLibrary = null;
      return mock.library.createOne()
        .then(mock => {
          mockLibrary = mock;
          return superagent.put(`:${process.env.PORT}/api/v1/library/${mockLibrary.library._id}`)
            .set('Authorization', `Bearer ${mock.token}`)
            .send({
              name: faker.lorem.word(),
              description: faker.lorem.words(6),
            });
        })
        .then(response => {
          expect(response.status).toEqual(204);
        });
    });
  });

  describe('Invalid request', () => {
    it('should return a 401 NOT AUTHORIZED given back token', () => {
      let mockLibrary = null;
      return mock.library.createOne()
        .then(mock => {
          mockLibrary = mock;
          return superagent.put(`:${process.env.PORT}/api/v1/library/${mockLibrary.library._id}`)
            .set('Authorization', `Bearer BADTOKEN`)
            .send({
              name: faker.lorem.word(),
              description: faker.lorem.words(4),
            });
        })
        .catch(err => expect(err.status).toEqual(401));
    });
      
    it('should return a 400 BAD REQUEST on improperly formatted body', () => {
      let mockLibrary = null;
      return mock.library.createOne()
        .then(mock => {
          mockLibrary = mock;
          return superagent.put(`:${process.env.PORT}/api/v1/library/${mockLibrary.library._id}`)
            .set('Authorization', `Bearer ${mock.token}`)
            .send({});
        })
        .catch(err => expect(err.status).toEqual(400));
    });

    it('should return a 404 BAD PATH for a valid request made with an id that was not found', () => {
      return mock.library.createOne()
        .then(mock => {
          return superagent.put(`:${process.env.PORT}/api/v1/library/BADID`)
            .set('Authorization', `Bearer ${mock.token}`)
            .send({
              name: faker.lorem.word(),
              description: faker.lorem.words(4),
            });
        })
        .catch(err => expect(err.status).toEqual(404));
    });
  });
});