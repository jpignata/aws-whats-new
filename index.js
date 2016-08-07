require('dotenv').config();

var https = require('https');
var striptags = require('striptags');
var Alexa = require('alexa-sdk');
var FeedParser = require('./feed_parser');
var Entities = require('html-entities');

var xmlEntities = new Entities.XmlEntities();
var htmlEntities = new Entities.AllHtmlEntities();

var PAGE_SIZE = 3;
var MAX_RESULTS = 25;

var handlers = {
  'LaunchRequest': function() {
    var output = 'Hi! Say news to hear what\'s new at a.w.s.';
    this.attributes['current'] = 0;

    ask(output, output, this);
  },

  'GetWhatsNew': function() {
    this.attributes['current'] = this.attributes['current'] || 0;

    https.get('https://aws.amazon.com/new/feed/', (res) => {
      FeedParser(res, (items) => {
        var current = this.attributes['current'];
        var next = Math.min(current + PAGE_SIZE, MAX_RESULTS);
        var output = '';
        var reprompt = '';

        if (current === 0) {
          output += 'Here\'s what\'s new at a.w.s.';
          output += '<break time="0.5s" />';

          reprompt = 'Say next to hear more news, say a number to hear more details about a specific item, or say repeat to hear these head lines again.';
        } else if (next < items.length) {
          reprompt = 'Do you want to hear more news?';
        } else {
          reprompt = 'Say a number to hear more details about a specific item.';
        }

        for (var i = current; i < next && i < items.length; i++) {
          output += `<say-as interpret-as="cardinal">${i + 1}</say-as>`;
          output += '<break time="0.25s" />';
          output += CleanString(items[i].title);
          output += '<break time="1.5s" />';
        }

        output += reprompt

        this.attributes['current'] = next;
        ask(output, reprompt, this);
      });
    });
  },

  'Repeat': function() {
    if (this.attributes['current']) {
      this.attributes['current'] = Math.max(this.attributes['current'] - PAGE_SIZE, 0);
    }

    this.emit('GetWhatsNew');
  },

  'GetMoreInformation': function() {
    var slots = this.event.request.intent.slots;

    if (!slots.Number) {
      return this.emit('Unhandled');
    }

    var number = parseInt(slots.Number.value, 10) - 1;

    if (isNaN(number)) {
      return this.emit('Unhandled');
    }

    this.attributes['current'] = this.attributes['current'] || 0;

    https.get('https://aws.amazon.com/new/feed/', (res) => {
      FeedParser(res, (items) => {
        if (items[number]) {
          var output = CleanString(items[number].description);
          var reprompt;

          if (this.attributes['current'] < MAX_RESULTS) {
            reprompt = 'Say next to hear more news, say a number to hear more details about a specific item, or say repeat to hear the previous head lines again.';
          } else {
            reprompt = 'Say a number to hear more details about a specific item or say repeat to hear the previous head lines again.';
          }

          output += '<break time="0.3s" />' + reprompt;

          ask(output, reprompt, this);
        } else {
          this.emit('Unhandled');
        }
      });
    });
  },

  'AMAZON.StopIntent': function() {
    tell('', this);
  },

  'AMAZON.CancelIntent': function() {
    this.emit('AMAZON.StopIntent');
  },

  'SessionEndedRequest': function() {
    this.emit('AMAZON.StopIntent');
  },

  'AMAZON.HelpIntent': function() {
    var output = 'Cloud news provides you with the latest news from a.w.s.. Say news to hear the most recent announcements.';
    var reprompt = 'Say news to hear what\'s new at a.w.s..';

    ask(output, reprompt, this);
  },

  'Unhandled': function() {
    var output = 'Sorry, I didn\'t get that. Would you like me to tell you the latest news at a.w.s.?';
    var reprompt = 'Would you like me to tell you the latest news at a.w.s.?';

    ask(output, reprompt, this);
  }
}

function ask(output, reprompt, alexa) {
  console.log(
    JSON.stringify({
      'response': {
        'type': 'ask',
        'output': output,
        'reprompt': reprompt
      }
    })
  );

  alexa.emit(':ask', output, reprompt);
}

function tell(output, alexa) {
  console.log(
    JSON.stringify({
      'response': {
        'type': 'tell',
        'output': output,
      }
    })
  );

  alexa.emit(':tell', output);
}

function CleanString(string) {
  var replacements = [
    ['AWS', 'a.w.s'],
    ['IoT', 'i.o.t.'],
    ['N. Virginia', 'Northern Virginia'],
  ];

  replacements.forEach(function(replacement) {
    var pattern = new RegExp(replacement[0], 'g');
    string = string.replace(pattern, replacement[1]);
  });

  string = striptags(string);
  string = htmlEntities.decode(string);
  string = xmlEntities.encode(string);

  return string;
}

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);

    console.log(JSON.stringify(event));

    alexa.appId = process.env.APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
