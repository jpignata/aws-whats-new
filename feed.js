var XmlStream = require('xml-stream');

exports.get = function(url, callback, opts) {
  var https;

  opts = opts || {};
  https = opts.https || require('https');

  https.get(url, (res) => {
    var xml = new XmlStream(res);
    var items = [];

    xml.on('endElement: item', (item) => items.push(item));
    xml.on('end', _ => callback(items));
  });
};
