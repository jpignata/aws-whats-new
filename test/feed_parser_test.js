var should = require('should');
var fs = require('fs');

var FeedParser = require('../feed_parser');

describe('FeedParser', function() {
  it('returns items from the RSS feed', function(done) {
    var stream = fs.createReadStream('./test/fixtures/feed.xml');

    FeedParser(stream, function(items) {
      items.length.should.equal(25);
      done();
    });
  });
});
