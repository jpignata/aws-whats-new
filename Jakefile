var ASYNC = { async: true };
var MOCHA = './node_modules/.bin/mocha';

var spawn = require('child_process').spawn;

desc('Build the deployment package.');
task('build', ['clean'], function() {
  var zip = spawn('zip', ['pkg/aws-whats-new', '-r', 'node_modules', '.env', 'index.js', 'feed_parser.js']);

  zip.stdout.on('data', function(data) {
    console.log(data+'');
  });

  zip.stderr.on('data', function(data) {
    console.log(data+'');
  });

  zip.on('close', function() {
    console.log('Built pkg/aws-whats-new.zip.');
    complete();
  });
}, ASYNC);

desc('Update the Lambda function.');
task('update', ['build'], function() {
  var aws = spawn('aws', [
      'lambda',
      'update-function-code',
      '--function-name', 'AWSWhatsNew',
      '--zip-file', 'fileb://pkg/aws-whats-new.zip'
  ]);

  aws.stdout.on('data', function(data) {
    console.log(data+'');
  });

  aws.stderr.on('data', function(data) {
    console.log(data+'');
  });

  aws.on('close', function() {
    console.log('Updated pkg/aws-whats-new.zip.');
    complete();
  });
}, ASYNC);

desc('Delete the package.');
task('clean', function() {
  var rm = spawn('rm', ['pkg/aws-whats-new.zip']);

  rm.on('close', function() {
    console.log('Deleted pkg/aws-whats-new.zip.');
    complete();
  });
}, ASYNC);

desc('Run tests.');
task('test', function() {
  jake.exec(MOCHA, { interactive: true, breakOnError: false }, function() {
    complete();
  });
}, ASYNC);
