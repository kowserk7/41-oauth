'use strict';

const Auth = require('../../model/auth');
const Library = require('../../model/library');
// const Photo = require('../../model/photo');
const faker = require('faker');

const mock = module.exports = {};

mock.auth = {};
mock.auth.createOne = () => {
  let resultAuth = {};
  resultAuth.password = faker.internet.password();

  return new Auth({
    username: faker.internet.userName(),
    email: faker.internet.email(),
  })
    .generatePasswordHash(resultAuth.password)
    .then(user => resultAuth.user = user)
    .then(user => user.generateToken())
    .then(token => resultAuth.token = token)
    .then(() => {
      return resultAuth;
    });
};
mock.auth.removeAll = () => Promise.all([Auth.remove()]);

mock.library = {};
mock.library.createOne = () => {
  let resultLibrary = null;

  return mock.auth.createOne()
    .then(mockLibrary => resultLibrary = mockLibrary)
    .then(mockLibrary => {
      return new Library({
        name: faker.internet.domainName(),
        description: faker.random.words(15),
        userId: mockLibrary.user._id,
      }).save();
    })
    .then(library => {
      resultLibrary.library = library;
      return resultLibrary;
    });
};
mock.library.removeAll = () => Promise.all([Library.remove()]);

// mock.photo = {};
// mock.photo.createOne = () => {
//   let resultPhoto = null;
//   return mock.library.createOne()
//     .then(mockPhoto => resultPhoto => mockPhoto)
//     .then(mockPhoto => {
//       return new Photo({
//         name: faker.internet.domainName(),
//         desc:  faker.random.words(15),
//         libraryId: mockPhoto.user._id,
//       }).save();
//     })
//     .then(photo => {
//       resultPhoto.photo = photo;
//       return resultPhoto;
//     });
// };
// mock.photo.removeAll = () => Promise.all([Photo.remove()]);
