require('dotenv').config();

var Alexa = require('alexa-sdk');
var CloudNews = new (require('./cloud_news')();

var FEED_URL = 'https://aws.amazon.com/new/feed/';
var PAGE_SIZE = 3;
var MAX_RESULTS = 25;

var handlers = {
  'LaunchRequest': function() {
    CloudNews.launch((response) => emit(response), this);
  },

  'GetWhatsNew': function() {
    var current = this.attributes['current'];

    CloudNews.index(current, (response) => emit(response), this);
  },

  'Repeat': function() {
    var current = this.attributes['current'];

    CloudNews.repeat(current, (response) => emit(response), this);
  },

  'GetMoreInformation': function() {
    var current = this.attributes['current'];
    var slotNumber = this.event.request.intent.slots.Number.value;
    var itemNumber = parseInt(slots.Number.value, 10) - 1;

    if (isNaN(itemNumber))
      return CloudNews.unhandled((response) => emit(response), this);

    CloudNews.details(itemNumber, current, (response) => emit(response), this);
  },

  'AMAZON.HelpIntent': function() {
    CloudNews.help((response) => emit(response));
  },

  'SessionEndedRequest': function() {
    end(this);
  },

  'AMAZON.StopIntent': function() {
    end(this);
  },

  'AMAZON.CancelIntent': function() {
    end(this);
  },

  'Unhandled': function() {
    CloudNews.unhandled((response) => emit(response));
  }
}

function emit(response, alexa) {
  var action;

  if (response.current) alexa.attributes['current'] = response.current;

  if (response.reprompt) {
    action = ':ask';
  } else {
    action = ':tell';
  }

  log({
    'action': action,
    'response': response.response,
    'reprompt': response.reprompt
  });

  alexa.emit(action, response.response, response.reprompt);
}

function log(obj) {
  console.log(JSON.stringify(obj));
}

function end(alexa) {
  alexa.emit(':tell');
}

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);

  alexa.appId = process.env.APP_ID;
  alexa.registerHandlers(handlers);

  log(event);
  alexa.execute();
};
