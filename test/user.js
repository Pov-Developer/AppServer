require('should');
var request = require('supertest');

var url = "http://localhost:5000";

describe('validate body', function() {

  describe('when the request contains a wrong credentials', function() {

    it('should return a 401 No Matching email response', function(done) {

      var login = {
        email: 'andrew.keig@gmail.com',
        password: '12356'
      };

      request(url)
        .post('users/login')
        .send(login)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          done();
        });
    });
  });

  describe('when the request contains an invalid email', function() {

    it('should return a 400 response and a single error', function(done) {

      var login = {
        email: 'andrew.keiggmail.com',
        password: '12356'
      };

      request(url)
        .post('users/login')
        .send(login)
        .expect(400)
        .end(function(err, res) {
          res.status.should.equal(400);
          res.body.errors.length.should.equal(1);
          done();
        });
    });
  });

  describe('when the request has a missing item in payload', function() {

    it('should return a 400 response and a single error', function(done) {

      var login = {
        email: 'andrew.keig@gmail.com',
        password: ''
      };

      request(url)
        .post('users/login')
        .send(login)
        .expect(400)
        .end(function(err, res) {
          res.body.errors.length.should.equal(1);
          res.body.errors[0].messages.length.should.equal(1);
          res.body.errors[0].types.length.should.equal(1);
          done();
        });
    });
  });

  describe('when the request has multiple missing items in payload', function() {

    it('should return a 400 response and two errors', function(done) {

      var login = {
        email: '',
        password: ''
      };

      request(url)
        .post('users/login')
        .send(login)
        .expect(400)
        .end(function(err, res) {
          res.body.errors.length.should.equal(2);
          // email cant be empty, and not valid email
          res.body.errors[0].messages.length.should.equal(2);
          res.body.errors[0].types.length.should.equal(2);
          // password cant be empty
          res.body.errors[1].messages.length.should.equal(1);
          res.body.errors[1].types.length.should.equal(1);
          done();
        });
    });
  });

  describe('when the request has extra items in payload', function() {

    it('should return a 400 response and one error', function(done) {

      var login = {
        email: 'andrew.keig@gmail.com',
        password: '12356',
        token: '1234'
      };

      request(url)
        .post('users/login')
        .send(login)
        .expect(400)
        .end(function(err, res) {
          res.body.errors.length.should.equal(1);
          res.body.errors[0].messages.length.should.equal(1);
          res.body.errors[0].types.length.should.equal(1);
          done();
        });
    });
  });
});