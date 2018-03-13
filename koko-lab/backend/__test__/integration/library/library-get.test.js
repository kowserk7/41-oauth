'use strict';

const server = require('../../../lib/server');
const superagent = require('superagent');
const mock = require('../../lib/mock');

describe('GET /api/v1/library/:id?', () => {
  beforeAll(server.start);
  beforeAll(() => mock.auth.createOne().then(data => this.mockAuth = data));
  afterAll(server.stop);
  afterAll(mock.auth.removeAll);
  afterAll(mock.library.removeAll);

  describe('Valid requests', () => {
    it('should return a 200 status code', () => {
      return mock.library.createOne()
        .then(mock => {
          return superagent.get(`:${process.env.PORT}/api/v1/library`)
            .set('Authorization', `Bearer ${mock.token}`);
        })
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body).toBeInstanceOf(Array);
        });
    });
    it('should return a 200 status code', () => {
      return mock.library.createOne()
        .then(mock => {
          console.log(this.mockAuth.user._id);
          return superagent.get(`:${process.env.PORT}/api/v1/library/${this.mockAuth.user._id}`)
            .set('Authorization', `Bearer ${mock.token}`);
        })
        .then(response => {
          expect(response.status).toEqual(200);
        });
    });
  });
  describe('Invalid request', () => {
    it('should return a 401 NOT AuthORIZED given back token', () => {
      return superagent.post(`:${process.env.PORT}/api/v1/library`)
        .set('Authorization', 'Bearer BADTOKEN')
        .catch(err => expect(err.status).toEqual(401));
    });
    it('should return a 400 BAD REQUEST on improperly formatted body', () => {
      return superagent.post(`:${process.env.PORT}/api/v1/library`)
        .set('Authorization', `Bearer ${this.mockAuth.token}`)
        .send({})
        .catch(err => expect(err.status).toEqual(400));
    });
  });
});