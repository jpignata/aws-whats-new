require('dotenv').config();

var https = require('https');
var striptags = require('striptags');
var Alexa = require('alexa-sdk');
var FeedParser = require('./feed_parser');

var PAGE_SIZE = 3;

var handlers = {
  'LaunchRequest': function() {
    var speechText = 'Hi! Say news to hear what\'s new at a.w.s.';

    this.attributes['current'] = 0;
    this.emit(':ask', speechText, speechText);
  },

  'GetWhatsNew': function() {
    this.attributes['current'] = this.attributes['current'] || 0;

    https.get('https://aws.amazon.com/new/feed/', (res) => {
      FeedParser(res, (items) => {
        var current = this.attributes['current'];
        var next = current + PAGE_SIZE;
        var speechText = '';
        var repromptText = '';

        if (current === 0) {
          speechText += 'Here\'s what\'s new at a.w.s.';
          speechText += '<break time="0.5s" />';

          repromptText = 'Say next to hear more news or say a number to hear more details about a specific item.';
        } else if (next < items.length) {
          repromptText = 'Do you want to hear more news?';
        } else {
          repromptText = 'Say a number to hear more details about a specific item.';
        }

        for (var i = current; i < next; i++) {
          speechText += `<say-as interpret-as="cardinal">${i + 1}</say-as>`;
          speechText += '<break time="0.25s" />';
          speechText += CleanString(items[i].title);
          speechText += '<break time="1.5s" />';
        }

        speechText += repromptText

        this.attributes['current'] = next;
        this.emit(':ask', speechText, repromptText);
      });
    });
  },

  'GetMoreInformation': function() {
    var slots = this.event.request.intent.slots;
    var number = parseInt(slots.Number.value, 10) - 1;

    https.get('https://aws.amazon.com/new/feed/', (res) => {
      FeedParser(res, (items) => {
        if (items[number]) {
          this.emit(':tell', CleanString(items[number].description));
        } else {
          this.emit(':ask', 'Sorry, I must have misunderstood. Which item would you like more details about?');
        }
      });
    });
  },

  'AMAZON.StopIntent': function() {
    this.emit(':tell', 'Okay.');
  },

  'AMAZON.CancelIntent': function() {
    this.emit('AMAZON.StopIntent');
  },

  'AMAZON.HelpIntent': function() {
    var helpText = 'Cloud news provides you with the latest news from a.w.s.. Say news to hear the most recent announcements.';
    var repromptText = 'Say news to hear what\'s new at a.w.s..';

    this.emit(':ask', helpText, repromptText);
  },

  'Unhandled': function() {
    this.emit(':ask', 'Sorry, I didn\'t get that. Would you like me to tell you the latest news at a.w.s.?', 'Would you like me to tell you the latest news at a.w.s.?');
  }
}

function CleanString(string) {
  var replacements = [
    ['AWS', 'a.w.s'],
    ['IoT', 'i.o.t.'],
    ['N. Virginia', 'Northern Virginia'],
    ['&nbsp;', '']
  ];

  replacements.forEach(function(replacement) {
    var pattern = new RegExp(replacement[0], 'g');
    string = string.replace(pattern, replacement[1]);
  });

  return striptags(string);
}

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);

    alexa.appId = process.env.APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
