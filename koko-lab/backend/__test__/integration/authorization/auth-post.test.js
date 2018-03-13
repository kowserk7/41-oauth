'use strict';

const server = require('../../../lib/server');
const superagent = require('superagent');
const mock = require('../../lib/mock');
const faker = require('faker');

describe('POST /api/v1/signup', function() {
  beforeAll(server.start);
  afterAll(server.stop);
  afterAll(mock.auth.removeAll);

  describe('Valid Requests', () => {
    beforeAll(() => {
      this.mockAuth = {
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: faker.internet.email(),
      };

      return superagent.post(`:${process.env.PORT}/api/v1/signup`)
        .send(this.mockAuth)
        .then(response => this.response = response)
        .catch(console.log);
    });

    it('should return a valid 201 CREATED status code', () => {
      expect(this.response.status).toEqual(201);
    });
    it('should return a valid token', () => {
      let tokenParts = this.response.body.split('.');
      let signature = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString());
      let token = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

      expect(signature.typ).toEqual('JWT');
      expect(token).toHaveProperty('token');
    });
  });

  describe('Invalid Requests', () => {
    it('should return a 404 NOT FOUND status code', () => {
      this.mockAuth = {
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: faker.internet.email(),
      };
      return superagent.post(`:${process.env.PORT}/api/v1/NOTFOUND`)
        .send(this.mockAuth)
        .catch(err => expect(err.status).toEqual(404));
    });
    it('should return a 401 NOT authORIZED status code', () => {
      return superagent.post(`:${process.env.PORT}/api/v1/signup`)
        .send({})
        .catch(err => expect(err.status).toEqual(401));
    });
    it('should return a 409 DUPLICATE KEY status when creating a user that already exists', () => {
      return superagent.post(`:${process.env.PORT}/api/v1/signup`)
        .send(this.mockAuth)
        .then(() => {
          return superagent.post(`:${process.env.PORT}/api/v1/signup`)
            .send(this.mockAuth);
        })
        .catch(err => expect(err.status).toEqual(409));
    });
  });
});