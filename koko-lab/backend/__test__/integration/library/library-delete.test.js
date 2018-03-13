'use strict';

const server = require('../../../lib/server');
const superagent = require('superagent');
const mock = require('../../lib/mock');

describe('DELETE /api/v1/library/:id?', () => {
  beforeAll(server.start);
  beforeAll(() => mock.auth.createOne().then(data => this.mockAuth = data));
  afterAll(server.stop);
  afterAll(mock.auth.removeAll);
  afterAll(mock.library.removeAll);

  describe('Valid request', () => {
    it('should return a 204 delete status code', () => {
      let mockLibrary = null;
      return mock.library.createOne()
        .then(mock => {
          mockLibrary = mock;
          return superagent.delete(`:${process.env.PORT}/api/v1/library/${mockLibrary.library._id}`)
            .set('Authorization', `Bearer ${mock.token}`);
        })
        .then(response => {
          expect(response.status).toEqual(204);
        });
    });
  });
  describe('Invalid request', () => {
    it('should return a 401 NOT AuthORIZED given back token', () => {
      let mockLibrary = null;
      return mock.library.createOne()
        .then(mock => {
          mockLibrary = mock;
          return superagent.delete(`:${process.env.PORT}/api/v1/library/${mockLibrary.library._id}`)
            .set('Authorization', `Bearer BAD TOKEN`);
        })
        .catch(err => expect(err.status).toEqual(401));
    });
    it('should return a 404 BAD PATH for a valid request made with an id that was not found', () => {
      return superagent.delete(`:${process.env.PORT}/api/v1/library/BADPATH}`)
        .set('Authorization', `Bearer ${this.mockAuth.token}`)
        .catch(err => expect(err.status).toEqual(404));
    });
  });
});