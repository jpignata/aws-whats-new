var fs = require('fs');

exports.get = (_, callback) => {
  callback(fs.createReadStream('./test/fixtures/feed.xml'));
}
