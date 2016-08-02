require('dotenv').config();

var https = require('https');
var striptags = require('striptags');
var Alexa = require('alexa-sdk');
var FeedParser = require('./feed_parser');

var PAGE_SIZE = 3;

var handlers = {
  'LaunchRequest': function () {
    this.emit('GetWhatsNew');
  },

  'NewSession': function() {
    this.emit('GetWhatsNew');
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
        }

        for (var i = current; i < next; i++) {
          speechText += `<say-as interpret-as="cardinal">${i + 1}</say-as>`;
          speechText += '<break time="0.25s" />';
          speechText += CleanString(items[i].title);
          speechText += '<break time="1.5s" />';
        }

        if (next < items.length) {
          repromptText = 'Do you want to hear more information on one of these items or hear more headlines?';
        } else {
          repromptText = 'Do you want to hear more information on one of these items?';
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
    var helpText = 'Cloud news provides you with the latest news from a.w.s.';
    var repromptText = ' Say headlines to hear the latest news.';

    this.emit(':ask', helpText + repromptText, repromptText);
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
