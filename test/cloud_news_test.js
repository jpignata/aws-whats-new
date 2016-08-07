var mockFeed = require('./support/mock_feed');
var CloudNews = new (require('../cloud_news'))(mockFeed);

describe('CloudNews', function() {
  describe('launch', function() {
    it('returns current index 0', (done) => {
      CloudNews.launch(function(response) {
        response.current.should.equal(0);
        done();
      });
    });
  });

  describe('index', function() {
    context('the first page', function() {
      it('adds the preamble', (done) => {
        CloudNews.index(0, function(response) {
          response.response.should.match(/^Here's what's new at a.w.s./);
          done();
        });
      });

      it('returns the first three items', (done) => {
        CloudNews.index(0, function(response) {
          response.response.should.match(/<say-as interpret-as="cardinal">1<\/say-as>/);
          response.response.should.match(/<say-as interpret-as="cardinal">2<\/say-as>/);
          response.response.should.match(/<say-as interpret-as="cardinal">3<\/say-as>/);
          done();
        });
      });

      it('explains the next options', (done) => {
        CloudNews.index(0, function(response) {
          response.response.should.match(/Say next to hear more news, say a number to hear more details about a specific item, or say repeat to hear these head lines again./);
          done();
        });
      });

      it('returns current index 3', (done) => {
        CloudNews.index(0, function(response) {
          response.current.should.equal(3);
          done();
        });
      });
    });

    context('the next page', function() {
      it('does not add the preamble', (done) => {
        CloudNews.index(3, function(response) {
          response.response.should.not.match(/^Here's what's new at a.w.s./);
          done();
        });
      });

      it('returns the next three items', (done) => {
        CloudNews.index(3, function(response) {
          response.response.should.match(/<say-as interpret-as="cardinal">4<\/say-as>/);
          response.response.should.match(/<say-as interpret-as="cardinal">5<\/say-as>/);
          response.response.should.match(/<say-as interpret-as="cardinal">6<\/say-as>/);
          done();
        });
      });

      it('asks if the user wants to hear more', (done) => {
        CloudNews.index(3, function(response) {
          response.response.should.match(/Do you want to hear more news\?/);
          done();
        });
      });

      it('returns current index 6', (done) => {
        CloudNews.index(3, function(response) {
          response.current.should.equal(6);
          done();
        });
      });
    });

    context('the last page', function() {
      it('does not add the preamble', (done) => {
        CloudNews.index(24, function(response) {
          response.response.should.not.match(/^Here's what's new at a.w.s./);
          done();
        });
      });

      it('returns the last item', (done) => {
        CloudNews.index(24, function(response) {
          response.response.should.match(/<say-as interpret-as="cardinal">25<\/say-as>/);
          done();
        });
      });

      it('prompts the user to say a number to hear more about a new items', (done) => {
        CloudNews.index(24, function(response) {
          response.response.should.match(/Say a number to hear more details about a specific item./);
          done();
        });
      });

      it('returns current index 25 (MAX_RESULTS)', (done) => {
        CloudNews.index(24, function(response) {
          response.current.should.equal(25);
          done();
        });
      });
    });

    context('a number equal to 25 (MAX_RESULTS)', function() {
      it('emits a message saying there are no other items', (done) => {
        CloudNews.index(25, function(response) {
          response.response.should.match(/That's all for the news/)
          done();
        });
      });
    });

    context('a number greater than 25 (MAX_RESULTS)', function() {
      it('emits a message saying there are no other items', (done) => {
        CloudNews.index(90, function(response) {
          response.response.should.match(/That's all for the news/)
          done();
        });
      });
    });
  });

  describe('details', function() {
    var itemNumber = 10;
    var current = 12;
    var lastItem = 25;
    var outOfBoundsIndex = 99;

    context('the item exists and the user is not on the last page', function() {
      it('returns details on the requested item', (done) => {
        CloudNews.details(itemNumber, current, function(response) {
          response.response.should.match(/CloudWatch Events is now available in the Asia Pacific/);
          done();
        });
      });

      it('prompts the user to say next or a number', (done) => {
        CloudNews.details(itemNumber, current, function(response) {
          response.reprompt.should.equal("Say next to hear more news, say a number to hear more details about a specific item, or say repeat to hear the previous head lines again.");
          done();
        });
      });
    });

    context('the user is on the last page', function() {
      it('prompts the user to say a number', (done) => {
        CloudNews.details(itemNumber, lastItem, function(response) {
          response.reprompt.should.equal("Say a number to hear more details about a specific item or say repeat to hear the previous head lines again.");
          done();
        });
      });
    });

    context("the item number doesn't exist", function() {
      it('returns an error', (done) => {
        CloudNews.details(outOfBoundsIndex, current, function(response) {
          response.response.should.match(/Sorry, that doesn't seem to be a valid item./);
          done();
        });
      });
    });
  });
});
