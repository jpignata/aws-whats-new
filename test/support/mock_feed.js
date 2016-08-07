var Feed = require('../../feed');
var https = require('./mock_https');

exports.get = function(url, callback, opts) {
  return Feed.get(url, callback, { 'https': https });
}
