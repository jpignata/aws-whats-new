var StripTags = require('striptags');
var Entities = require('html-entities');

var XmlEntities = new Entities.XmlEntities();
var HtmlEntities = new Entities.AllHtmlEntities();

var REPLACEMENTS = [
  ['AWS', 'a.w.s'],
  ['IoT', 'i.o.t.'],
  ['N. Virginia', 'Northern Virginia'],
];

exports.clean = function(line) {
  REPLACEMENTS.forEach(function(replacement) {
    var pattern = new RegExp(replacement[0], 'g');
    var token = replacement[1];

    line = line.replace(pattern, token);
  });

  line = StripTags(line);
  line = HtmlEntities.decode(line);
  line = XmlEntities.encode(line);

  return line;
}
