var XmlStream = require('xml-stream');

module.exports = function(stream, callback, opts) {
  opts = opts || {};

  var now = opts.now || new Date();
  var xml = new XmlStream(stream);
  var items = [];

  xml.on('endElement: item', (item) => items.push(item));
  xml.on('end', _ => callback(items));
};
