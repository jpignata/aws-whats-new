var Feed = require('./feed');
var Line = require('./line');

var FEED_URL = 'https://aws.amazon.com/new/feed/';
var PAGE_SIZE = 3;
var MAX_RESULTS = 25;

function CloudNews(feed) {
  this.feed = feed || Feed
}

CloudNews.prototype.launch = function(callback) {
  var response = "Hi! Say news to hear what's new at a.w.s.";
  var reprompt = 'You can say news to hear announcements from Amazon Web Services or you can say exit.';

  callback(new Response(response, reprompt, 0));
}

CloudNews.prototype.index = function(current, callback) {
  current = current || 0;

  var response;
  var reprompt;
  var next = Math.min(current + PAGE_SIZE, MAX_RESULTS);

  if (current === 0) {
    response = `Here's what's new at a.w.s.<break time="0.5s" />`;
    reprompt = 'Say next to hear more news, say a number to hear more details about a specific item, or say repeat to hear these head lines again.';
  } else if (current >= MAX_RESULTS) {
    response = "That's all for the news."
    reprompt = 'Say a number to hear more details about a specific item.';

    return callback(new Response(response, reprompt, next));
  } else if (next === MAX_RESULTS) {
    response = '';
    reprompt = 'Say a number to hear more details about a specific item.';
  } else {
    response = '';
    reprompt = 'Do you want to hear more news?';
  }

  this.feed.get(FEED_URL, (items) => {
    for (var i = current; i < next; i++) {
      response += `<say-as interpret-as="cardinal">${i + 1}</say-as>`;
      response += '<break time="0.3s" />';
      response += Line.clean(items[i].title);
      response += '<break time="1.5s" />';
    }

    callback(new Response(response, reprompt, next));
  });
}

CloudNews.prototype.repeat = function(current, callback) {
  this.index(current - PAGE_SIZE, callback);
}

CloudNews.prototype.details = function(itemNumber, current, callback) {
  var response;
  var reprompt;

  this.feed.get(FEED_URL, (items) => {
    var item = items[itemNumber];

    if (item) {
      response = Line.clean(item.description);

      if (current < MAX_RESULTS) {
        reprompt = 'Say next to hear more news, say a number to hear more details about a specific item, or say repeat to hear the previous head lines again.';
      } else {
        reprompt = 'Say a number to hear more details about a specific item or say repeat to hear the previous head lines again.';
      }
    } else {
      response = "Sorry, that doesn't seem to be a valid item.";
      reprompt = 'Say a number to hear more details about a specific item or say repeat to hear the previous head lines again.';
    }

    callback(new Response(response, reprompt));
  });
}

CloudNews.prototype.unhandled = function(callback) {
  var response = "Sorry, I didn't get that. Would you like me to tell you the latest news at a.w.s.?";
  var reprompt = 'Would you like me to tell you the latest news at a.w.s.?';

  callback(new Response(response, reprompt));
}

CloudNews.prototype.help = function(callback) {
  var response= 'Cloud news provides you with the latest news from a.w.s.. Say news to hear the most recent announcements.';
  var reprompt = "Say news to hear what's new at a.w.s..";

  callback(new Response(response, reprompt));
}

function Response(response, reprompt, current) {
  if (reprompt) response += '<break time="0.3s" />' + reprompt;

  this.response = response;
  this.reprompt = reprompt;
  this.current = current;
}

module.exports = CloudNews;
