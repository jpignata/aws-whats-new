var should = require('should');

var Line = require('../line');

describe('Line', function() {
  describe('clean', function() {
    it('strips HTML tags', function() {
      var line = '<blink>OH HAI</blink>';

      Line.clean(line).should.equal('OH HAI');
    });

    it('replaces known problem acronyms', function() {
      var line = 'IoT something something';

      Line.clean(line).should.equal('i.o.t. something something');
    });

    it('replaces HTML encoding entities', function() {
      var line = 'EC2&copy;';

      Line.clean(line).should.equal('EC2©');
    });

    it('encodes XML entities', function() {
      var line = 'EC2 & S3';

      Line.clean(line).should.equal('EC2 &amp; S3');
    });
  });
});
