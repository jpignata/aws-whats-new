var should = require('should');

var Feed = require('../feed');
var mockHttps = require('./support/mock_https');

describe('Feed', function() {
  describe('get', function() {
    it('returns items from the RSS feed', function(done) {
      Feed.get('http://localhost/feed.xml', function(items) {
        items.length.should.equal(25);
        done();
      }, { 'https': mockHttps });
    });
  });
});
